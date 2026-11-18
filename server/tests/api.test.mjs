import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";
import { createApp } from "../app.mjs";
import { listArticles } from "../features/articles/articles.mjs";

async function withApi(t, options) {
  const server = createServer(createApp(options));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

const catalogUrl = new URL("../../public/data/articles.json", import.meta.url);

test("health returns the minimal JSON contract", async (t) => {
  const base = await withApi(t);
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("articles preserve every authoritative catalog record, ID, and URL", async (t) => {
  const base = await withApi(t);
  const source = JSON.parse(await readFile(catalogUrl, "utf8"));
  const response = await fetch(`${base}/api/articles`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, { articles: source });
  assert.deepEqual(body.articles.map(({ id, url }) => ({ id, url })),
    source.map(({ id, url }) => ({ id, url })));
});

test("category slugs filter articles while retaining catalog metadata", async (t) => {
  const base = await withApi(t);
  const source = JSON.parse(await readFile(catalogUrl, "utf8"));
  for (const [slug, category] of [
    ["anime", "Anime"],
    ["videojuegos", "Videojuegos"],
    ["peliculas", "Películas"],
  ]) {
    const response = await fetch(`${base}/api/articles?category=${slug}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      articles: source.filter((article) => article.category === category),
    });
  }
});

test("a valid filter with no records returns an empty collection", async (t) => {
  const source = JSON.parse(await readFile(catalogUrl, "utf8"));
  const fixture = source.filter((article) => article.category !== "Películas");
  const base = await withApi(t, {
    getArticles: (category) => listArticles(category, {
      readCatalog: async () => JSON.stringify(fixture),
    }),
  });
  const response = await fetch(`${base}/api/articles?category=peliculas`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { articles: [] });
});

test("invalid, unknown, and repeated query parameters return 400", async (t) => {
  const base = await withApi(t);
  for (const path of [
    "/api/articles?category=unknown",
    "/api/articles?category=Anime",
    "/api/articles?category=",
    "/api/articles?category=anime&category=anime",
    "/api/articles?other=value",
    "/api/health?category=anime",
  ]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 400, path);
    assert.deepEqual(await response.json(), {
      error: { code: "INVALID_QUERY", message: "Invalid query parameters" },
    });
  }
});

test("unknown routes return 404 and known routes reject other methods with Allow", async (t) => {
  const base = await withApi(t);
  const missing = await fetch(`${base}/api/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), {
    error: { code: "NOT_FOUND", message: "Endpoint not found" },
  });

  for (const path of ["/api/health", "/api/articles"]) {
    const response = await fetch(`${base}${path}`, { method: "POST" });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET");
    assert.deepEqual(await response.json(), {
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
    });
  }
});

test("CORS allows only the known frontend origin and advertises only GET", async (t) => {
  const base = await withApi(t);
  const allowed = await fetch(`${base}/api/articles`, {
    headers: { Origin: "http://127.0.0.1:3000" },
  });
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://127.0.0.1:3000");
  assert.equal(allowed.headers.get("vary"), "Origin");
  assert.equal(allowed.headers.get("access-control-allow-credentials"), null);
  assert.equal(allowed.headers.get("access-control-allow-methods"), null);

  const allowedError = await fetch(`${base}/api/articles?category=unknown`, {
    headers: { Origin: "http://127.0.0.1:3000" },
  });
  assert.equal(allowedError.status, 400);
  assert.equal(allowedError.headers.get("access-control-allow-origin"), "http://127.0.0.1:3000");

  const other = await fetch(`${base}/api/health`, {
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(other.status, 200);
  assert.equal(other.headers.get("access-control-allow-origin"), null);
  assert.equal(other.headers.get("vary"), "Origin");

  const preflight = await fetch(`${base}/api/articles`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://127.0.0.1:3000",
      "Access-Control-Request-Method": "POST",
    },
  });
  assert.equal(preflight.status, 405);
  assert.equal(preflight.headers.get("allow"), "GET");
  assert.equal(preflight.headers.get("access-control-allow-methods"), null);
});

test("catalog failures reject and API 500 responses hide internal details", async (t) => {
  const source = JSON.parse(await readFile(catalogUrl, "utf8"));
  const readCatalog = (text) => async () => text;
  await assert.rejects(listArticles(undefined, {
    readCatalog: async () => { throw new Error("ENOENT /private/catalog.json"); },
  }));
  await assert.rejects(listArticles(undefined, {
    readCatalog: async () => { throw new Error("EACCES /private/catalog.json"); },
  }));
  await assert.rejects(listArticles(undefined, { readCatalog: readCatalog("{") }), SyntaxError);
  for (const invalid of [
    {}, [], [{ ...source[0], id: "bad id" }],
    [{ ...source[0], category: "Unknown" }],
    [{ ...source[0], url: "../private/file.html" }],
    [{ ...source[0], keywords: [42] }],
    [source[0], source[0]],
  ]) {
    await assert.rejects(listArticles(undefined, {
      readCatalog: readCatalog(JSON.stringify(invalid)),
    }), /Invalid article catalog/);
  }

  const base = await withApi(t, {
    getArticles: async () => { throw new Error("ENOENT /private/catalog.json"); },
  });
  const originalError = console.error;
  console.error = () => {};
  try {
    const response = await fetch(`${base}/api/articles`);
    assert.equal(response.status, 500);
    assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
    assert.deepEqual(await response.json(), {
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  } finally {
    console.error = originalError;
  }
});
