const catalogUrl = new URL("../../../data/articles.json", import.meta.url);
const articleRoot = new URL("../../../", import.meta.url);
const categories = ["Anime", "Videojuegos", "Películas"];

function validArticle(value) {
  return value && typeof value.id === "string" && /^[a-z0-9-]+$/.test(value.id)
    && categories.includes(value.category) && typeof value.title === "string"
    && typeof value.description === "string" && typeof value.url === "string"
    && value.url.startsWith("articulos/") && !value.url.includes("..")
    && Array.isArray(value.keywords) && value.keywords.every((word) => typeof word === "string");
}

export function articleHref(article) { return new URL(article.url, articleRoot).href; }

export async function loadArticleCatalog() {
  const response = await fetch(catalogUrl);
  if (!response.ok) throw new Error(`El catálogo respondió con HTTP ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0 || !data.every(validArticle)
      || new Set(data.map((item) => item.id)).size !== data.length) {
    throw new Error("El catálogo de artículos no tiene un formato válido.");
  }
  return data;
}
