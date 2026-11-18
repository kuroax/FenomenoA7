import { categoryFromFilter, listArticles } from "./features/articles/articles.mjs";

const frontendOrigin = "http://127.0.0.1:3000";
const errorBody = (code, message) => ({ error: { code, message } });

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

export function createApp({ getArticles = listArticles } = {}) {
  return async (request, response) => {
    const corsHeaders = request.headers.origin === frontendOrigin
      ? { "Access-Control-Allow-Origin": frontendOrigin }
      : {};

    try {
      const url = new URL(request.url, "http://127.0.0.1");
      if (url.pathname !== "/api/health" && url.pathname !== "/api/articles") {
        sendJson(response, 404, errorBody("NOT_FOUND", "Endpoint not found"), corsHeaders);
        return;
      }

      if (request.method !== "GET") {
        sendJson(response, 405, errorBody("METHOD_NOT_ALLOWED", "Method not allowed"), {
          ...corsHeaders,
          "Allow": "GET",
        });
        return;
      }

      // Both endpoints reject unknown and repeated query parameters.
      const keys = [...url.searchParams.keys()];
      const validQuery = url.pathname === "/api/health"
        ? keys.length === 0
        : keys.length === 0 || (keys.length === 1 && keys[0] === "category");
      const filter = url.searchParams.get("category");
      const category = filter === null ? undefined : categoryFromFilter(filter);
      if (!validQuery || (filter !== null && category === undefined)) {
        sendJson(response, 400, errorBody("INVALID_QUERY", "Invalid query parameters"), corsHeaders);
        return;
      }

      if (url.pathname === "/api/health") {
        sendJson(response, 200, { status: "ok" }, corsHeaders);
        return;
      }

      sendJson(response, 200, { articles: await getArticles(category) }, corsHeaders);
    } catch (error) {
      console.error("API request failed:", error);
      if (!response.headersSent) {
        sendJson(response, 500, errorBody("INTERNAL_ERROR", "Internal server error"), corsHeaders);
      } else {
        response.destroy();
      }
    }
  };
}
