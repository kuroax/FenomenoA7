const storageKey = "fenomenoa7-theme";
let initialized = false;

function readPreference() {
  try {
    const preference = window.localStorage.getItem(storageKey);
    return preference === "light" || preference === "dark" ? preference : null;
  } catch {
    return null;
  }
}

function applyTheme(theme, button) {
  const isDark = theme === "dark";
  const root = document.documentElement;

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = theme;
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute(
    "aria-label",
    isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
  );
  button.textContent = isDark ? "Tema oscuro" : "Tema claro";
}

function persistPreference(theme) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // The active theme still changes for this page when storage is unavailable.
  }
}

export function initializeThemeToggle() {
  if (initialized) return;

  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  initialized = true;
  const root = document.documentElement;
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

  button.hidden = false;
  applyTheme(root.classList.contains("dark") ? "dark" : "light", button);

  button.addEventListener("click", () => {
    const nextTheme = root.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme, button);
    persistPreference(nextTheme);
  });

  systemPreference.addEventListener("change", (event) => {
    if (readPreference() === null) {
      applyTheme(event.matches ? "dark" : "light", button);
    }
  });
}
