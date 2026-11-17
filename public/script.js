(() => {
  const root = document.documentElement;
  const storageKey = "fenomenoa7-theme";
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

  function readPreference() {
    try {
      const preference = window.localStorage.getItem(storageKey);
      return preference === "light" || preference === "dark" ? preference : null;
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = theme;

    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
      button.textContent = isDark ? "Tema oscuro" : "Tema claro";
    }
  }

  applyTheme(readPreference() ?? (systemPreference.matches ? "dark" : "light"));

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;

    button.hidden = false;
    applyTheme(root.classList.contains("dark") ? "dark" : "light");
    button.addEventListener("click", () => {
      const nextTheme = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {
        // The active theme still changes for this page when storage is unavailable.
      }
    });
  });

  systemPreference.addEventListener("change", (event) => {
    if (readPreference() === null) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
})();
