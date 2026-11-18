import { articleHref } from "../article-catalog/catalog.js";
const key = "fenomenoa7-bookmarks";
let initialized = false;
function read() { try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === "string"))] : []; } catch { return []; } }
function write(ids) { try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* In-memory state remains usable. */ } }

export function initializeBookmarks(articles) {
  if (initialized) return;
  const list = document.querySelector("[data-bookmark-list]");
  if (!document.querySelector("[data-bookmark-id]") && !list) return;
  initialized = true;
  const available = new Map(articles.map((article) => [article.id, article]));
  let saved = read().filter((id) => available.has(id));
  write(saved);
  const render = () => {
    document.querySelectorAll("[data-bookmark-id]").forEach((button) => {
      const active = saved.includes(button.dataset.bookmarkId);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? "Quitar de artículos guardados" : "Guardar artículo");
      button.textContent = active ? "Artículo guardado · Quitar" : "Guardar artículo";
    });
    if (list) {
      list.replaceChildren(...saved.map((id) => available.get(id)).filter(Boolean).map((article) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = articleHref(article);
        link.className = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-700";
        link.textContent = article.title;
        li.append(link);
        return li;
      }));
      const empty = document.querySelector("[data-bookmark-empty]");
      if (empty) empty.hidden = saved.length > 0;
    }
  };
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-bookmark-id]");
    if (!button) return;
    const id = button.dataset.bookmarkId;
    if (!available.has(id)) return;
    saved = saved.includes(id) ? saved.filter((entry) => entry !== id) : [...saved, id];
    write(saved);
    render();
  });
  render();
}
