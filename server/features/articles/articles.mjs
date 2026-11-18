import { readFile } from "node:fs/promises";

const catalogUrl = new URL("../../../public/data/articles.json", import.meta.url);
const categories = new Map([
  ["anime", "Anime"],
  ["videojuegos", "Videojuegos"],
  ["peliculas", "Películas"],
]);
const categoryValues = new Set(categories.values());

// The URL filter uses stable, unaccented slugs; catalog records retain their original labels.
export function categoryFromFilter(filter) {
  return categories.get(filter);
}

function validArticle(value) {
  return value && typeof value === "object"
    && typeof value.id === "string" && /^[a-z0-9-]+$/.test(value.id)
    && categoryValues.has(value.category)
    && typeof value.title === "string"
    && typeof value.description === "string"
    && typeof value.url === "string" && value.url.startsWith("articulos/")
    && !value.url.includes("..")
    && Array.isArray(value.keywords)
    && value.keywords.every((word) => typeof word === "string");
}

export async function listArticles(category, { readCatalog = readFile, path = catalogUrl } = {}) {
  const data = JSON.parse(await readCatalog(path, "utf8"));
  if (!Array.isArray(data) || data.length === 0 || !data.every(validArticle)
      || new Set(data.map((article) => article.id)).size !== data.length) {
    throw new Error("Invalid article catalog");
  }

  return category === undefined ? data : data.filter((article) => article.category === category);
}
