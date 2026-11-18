import { articleHref } from "../article-catalog/catalog.js";

const fold = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
let initialized = false;

export function filterArticles(articles, query, category = "") {
  const normalizedQuery = fold(query.trim());
  return articles.filter((article) => (!category || article.category === category)
    && fold([article.category, article.title, article.description, ...article.keywords].join(" ")).includes(normalizedQuery));
}

export function initializeArticleDiscovery(articles) {
  const form = document.querySelector("[data-article-search]");
  const results = document.querySelector("[data-article-results]");
  const input = form?.querySelector("input[type=search]");
  const filter = document.querySelector("[data-category-filter]");
  const status = document.querySelector("[data-search-status]");
  if (!form || !results || !input || !filter || !status || initialized) return;
  initialized = true;
  const render = () => {
    const query = input.value;
    const category = filter.value;
    const matching = filterArticles(articles, query, category);
    const cards = matching.map((article) => {
      const card = document.createElement("article");
      card.className = "border-t border-stone-300 pt-5 dark:border-stone-700";
      const heading = document.createElement("h3");
      heading.className = "text-xl font-semibold tracking-tight";
      const link = document.createElement("a");
      link.className = "rounded-sm underline decoration-amber-700 underline-offset-4 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700 dark:decoration-amber-400 dark:hover:text-amber-300 dark:focus-visible:outline-amber-400";
      link.href = articleHref(article);
      link.textContent = article.title;
      heading.append(link);
      const tag = document.createElement("p");
      tag.className = "mt-2 text-sm font-medium text-amber-800 dark:text-amber-300";
      tag.textContent = article.category;
      const description = document.createElement("p");
      description.className = "mt-3 leading-7 text-stone-600 dark:text-stone-300";
      description.textContent = article.description;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.bookmarkId = article.id;
      button.className = "mt-3 min-h-11 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:border-stone-700 dark:focus-visible:outline-amber-400";
      button.textContent = "Guardar artículo";
      card.append(heading, tag, description, button);
      return card;
    });
    results.replaceChildren(...cards);
    status.textContent = matching.length ? `${matching.length} ${matching.length === 1 ? "artículo encontrado" : "artículos encontrados"}.` : "No hay artículos que coincidan. Prueba otra búsqueda o categoría.";
  };
  form.addEventListener("input", render);
  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("reset", () => requestAnimationFrame(render));
  filter.addEventListener("change", render);
  render();
}
