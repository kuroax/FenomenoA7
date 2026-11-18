let initialized = false;
export function initializeTableOfContents() {
  const nav = document.querySelector("[data-table-of-contents]");
  if (!nav || initialized) return;
  initialized = true;
  const links = [...nav.querySelectorAll("a[href^='#']")];
  const sections = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    links.forEach((link) => link.hash.slice(1) === active.target.id ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current"));
  }, { rootMargin: "-12% 0px -70% 0px", threshold: [0, 0.25, 0.5] });
  sections.forEach((section) => observer.observe(section));
}
