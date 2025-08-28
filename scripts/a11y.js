/**
 * Sets up all accessibility-related event listeners and initial states.
 * This includes keyboard navigation, theme toggles, and text size controls.
 */
export function setupA11y() {
  // Ensure a live region exists for announcements (SR only).
  let live = document.getElementById("a11y-live");
  if (!live) {
    live = document.createElement("div");
    live.id = "a11y-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.style.position = "absolute";
    live.style.width = "1px";
    live.style.height = "1px";
    live.style.overflow = "hidden";
    live.style.clip = "rect(1px,1px,1px,1px)";
    live.style.clipPath = "inset(50%)";
    live.style.whiteSpace = "nowrap";
    live.style.border = "0";
    document.body.appendChild(live);
  }
  const announce = (msg) => { live.textContent = msg; };

  // Elements (guard each one)
  const themeToggleBtn = document.getElementById("theme-toggle");
  const sizeIncreaseBtn = document.getElementById("size-increase");
  const sizeDecreaseBtn = document.getElementById("size-decrease");
  const vocabPanel = document.getElementById("vocab-panel");
  const vocabCloseBtn = document.getElementById("close-vocab-btn");
  const menuBtn = document.getElementById("menu-btn");
  const navMenu = document.getElementById("nav-menu");

  // THEME TOGGLE (light/dark)
  if (themeToggleBtn) {
    const applyThemeAria = () => {
      const dark = document.body.classList.contains("theme-dark");
      themeToggleBtn.setAttribute("aria-pressed", String(dark));
    };
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("theme-dark");
      document.body.classList.toggle("theme-light", !document.body.classList.contains("theme-dark"));

      const newTheme = document.body.classList.contains("theme-dark") ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      if (window.appData?.settings) window.appData.settings.theme = newTheme;

      applyThemeAria();
      announce(newTheme === "dark" ? "Mørk modus på." : "Lys modus på.");
    });
    applyThemeAria();
  }

  // TEXT SIZE (via CSS var --text-base)
  if (sizeIncreaseBtn) {
    sizeIncreaseBtn.addEventListener("click", () => {
      let current = Number(window.appData?.settings?.textSize ?? 1);
      const next = clamp(round1(current + 0.1), 0.9, 2);
      if (next !== current) {
        applyTextSize(next);
        announce(`Tekststørrelse ${Math.round(next * 100)} prosent.`);
      }
    });
  }
  if (sizeDecreaseBtn) {
    sizeDecreaseBtn.addEventListener("click", () => {
      let current = Number(window.appData?.settings?.textSize ?? 1);
      const next = clamp(round1(current - 0.1), 0.9, 2);
      if (next !== current) {
        applyTextSize(next);
        announce(`Tekststørrelse ${Math.round(next * 100)} prosent.`);
      }
    });
  }

  // VOCAB PANEL
  if (vocabPanel && vocabCloseBtn) {
    vocabCloseBtn.addEventListener("click", () => {
      vocabPanel.hidden = true;
      announce("Ordliste lukket.");
    });
  }

  // MOBILE MENU
  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
      const next = !isExpanded;
      menuBtn.setAttribute("aria-expanded", String(next));
      navMenu.classList.toggle("expanded", next);
      announce(next ? "Meny åpnet." : "Meny lukket.");
    });
  }

  // Keyboard-based drag and drop (defensive)
  document.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    if (!activeEl) return;

    if (e.key === " " && (activeEl.classList.contains("match-item") ||
                          activeEl.classList.contains("sortable-item") ||
                          activeEl.classList.contains("drag-item"))) {
      e.preventDefault();
      const grabbed = activeEl.getAttribute("aria-grabbed") === "true";
      activeEl.setAttribute("aria-grabbed", String(!grabbed));
      announce(!grabbed ? "Element valgt." : "Element sluppet.");
    }

    if (e.key === "Enter" && (activeEl.classList.contains("target-item") || activeEl.classList.contains("drop-zone"))) {
      const card = activeEl.closest(".task-card");
      if (!card) return;
      const grabbedItem = card.querySelector('.match-item[aria-grabbed="true"], .sortable-item[aria-grabbed="true"], .drag-item[aria-grabbed="true"]');
      if (!grabbedItem) return;

      const event = new CustomEvent("drop", {
        detail: { keyboard: true, source: grabbedItem },
        bubbles: true,
        cancelable: true,
      });
      activeEl.dispatchEvent(event);
      grabbedItem.setAttribute("aria-grabbed", "false");
      announce("Element plassert.");
    }
  });
}

/**
 * Applies the current text size setting.
 * Uses CSS variable --text-base so the whole app scales consistently.
 * @param {number} size multiplier (0.9 - 2.0)
 */
function applyTextSize(size) {
  const clamped = clamp(size, 0.9, 2);
  document.documentElement.style.setProperty("--text-base", `${clamped}rem`);
  localStorage.setItem("textSize", String(clamped));
  if (window.appData?.settings) window.appData.settings.textSize = clamped;
}

/**
 * Applies saved settings (theme, text size, high contrast).
 * Avoid wiping unrelated classes from <body>.
 * @param {Object} settings
 */
export function applySettings(settings) {
  const body = document.body;
  body.classList.remove("theme-dark", "theme-light", "high-contrast");

  if (settings.theme === "dark") body.classList.add("theme-dark");
  else body.classList.add("theme-light");

  if (settings.highContrast) body.classList.add("high-contrast");

  applyTextSize(Number(settings.textSize ?? 1));
}

/* helpers */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round1(n) { return Math.round(n * 10) / 10; }
