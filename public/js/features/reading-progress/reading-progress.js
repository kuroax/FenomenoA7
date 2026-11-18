let initialized = false;

export function calculateReadingProgress(rect, viewportHeight) {
  const distance = Math.max(0, rect.height - viewportHeight);
  if (distance === 0) return rect.bottom <= viewportHeight ? 100 : 0;
  return Math.round(Math.min(1, Math.max(0, -rect.top / distance)) * 100);
}

export function initializeReadingProgress() {
  const region = document.querySelector("[data-reading-region]");
  const progress = document.querySelector("[data-reading-progress]");
  if (!region || !progress || initialized) return;
  initialized = true;
  const bar = progress.querySelector("[data-progress-bar]");
  const output = progress.querySelector("[data-progress-value]");
  let scheduled = false;
  let lastValue = -1;
  const update = () => {
    scheduled = false;
    const rect = region.getBoundingClientRect();
    const value = calculateReadingProgress(rect, window.innerHeight);
    if (value === lastValue) return;
    lastValue = value;
    progress.setAttribute("aria-valuenow", String(value));
    bar?.style.setProperty("width", `${value}%`);
    if (output) output.textContent = `${value}%`;
  };
  const requestUpdate = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(requestUpdate).observe(region);
  requestUpdate();
}
