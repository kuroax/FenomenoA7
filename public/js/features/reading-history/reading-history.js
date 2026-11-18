import { articleHref } from "../article-catalog/catalog.js";
const key = "fenomenoa7-reading-history";
const limit = 8;
let initialized = false;
function read() { try { const data = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(data) ? [...new Set(data.filter((id) => typeof id === "string"))].slice(0, limit) : []; } catch { return []; } }
function write(ids) { try { localStorage.setItem(key, JSON.stringify(ids.slice(0, limit))); } catch { /* Page remains usable without persistence. */ } }

export function initializeReadingHistory(articles) {
  if (initialized) return;
  const list = document.querySelector("[data-history-list]");
  const clear = document.querySelector("[data-history-clear]");
  const empty = document.querySelector("[data-history-empty]");
  const currentId = document.querySelector("[data-article-id]")?.dataset.articleId;
  if (!list && !currentId) return;
  initialized = true;
  const available = new Map(articles.map((article) => [article.id, article]));
  let history = read();
  // Keep existing IDs intact while the catalog is unavailable; a successful
  // catalog load lets us discard entries that no longer have a real article.
  if (available.size) history = history.filter((id) => available.has(id));
  if (currentId && (!available.size || available.has(currentId))) history = [currentId, ...history.filter((id) => id !== currentId)].slice(0, limit);
  write(history);
  const render = () => {
    if (!list) return;
    const nodes = history.map((id) => available.get(id)).filter(Boolean).map((article) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = articleHref(article);
      link.className = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-700";
      link.textContent = article.title;
      li.append(link);
      return li;
    });
    list.replaceChildren(...nodes);
    if (empty) empty.hidden = nodes.length > 0;
  };
  clear?.addEventListener("click", () => { history = []; write(history); render(); });
  render();
}
