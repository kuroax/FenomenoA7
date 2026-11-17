(() => {
  const root = document.documentElement;
  let preference = null;

  try {
    const storedPreference = window.localStorage.getItem("fenomenoa7-theme");
    if (storedPreference === "light" || storedPreference === "dark") {
      preference = storedPreference;
    }
  } catch {
    // The system preference remains available when storage cannot be read.
  }

  const theme = preference ?? (
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = theme;
})();
