import { initializeThemeToggle } from "./js/features/theme/theme-toggle.js";
import { loadArticleCatalog } from "./js/features/article-catalog/catalog.js";
import { initializeArticleDiscovery } from "./js/features/article-discovery/article-discovery.js";
import { initializeBookmarks } from "./js/features/bookmarks/bookmarks.js";
import { initializeReadingHistory } from "./js/features/reading-history/reading-history.js";
import { initializeReadingProgress } from "./js/features/reading-progress/reading-progress.js";
import { initializeTableOfContents } from "./js/features/table-of-contents/table-of-contents.js";
import { initializeFormValidation } from "./js/features/form-validation/form-validation.js";

initializeThemeToggle();

initializeReadingProgress();
initializeTableOfContents();
initializeFormValidation();

const searchStatus = document.querySelector("[data-search-status]");
const catalogStatus = document.querySelector("[data-catalog-status]");
if (searchStatus) searchStatus.textContent = "Cargando el catálogo local…";
if (catalogStatus) {
  catalogStatus.hidden = false;
  catalogStatus.textContent = "Cargando catálogo para lecturas guardadas e historial local…";
}
loadArticleCatalog().then((articles) => {
  if (catalogStatus) catalogStatus.hidden = true;
  initializeArticleDiscovery(articles);
  initializeBookmarks(articles);
  initializeReadingHistory(articles);
}).catch((error) => {
  const status = searchStatus || catalogStatus;
  if (status) status.textContent = `No se pudo cargar el catálogo local. Los enlaces del sitio siguen disponibles. ${error.message}`;
  initializeReadingHistory([]);
});
