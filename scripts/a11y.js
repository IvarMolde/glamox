/**
 * Sets up all accessibility-related event listeners and initial states.
 * This includes keyboard navigation, theme toggles, and text size controls.
 */
export function setupA11y() {
  // Select all necessary elements.
  const themeToggleBtn = document.getElementById("theme-toggle");
  const sizeIncreaseBtn = document.getElementById("size-increase");
  const sizeDecreaseBtn = document.getElementById("size-decrease");
  const vocabPanel = document.getElementById("vocab-panel");
  const vocabCloseBtn = document.getElementById("close-vocab-btn");
  const menuBtn = document.getElementById("menu-btn");
  const navMenu = document.getElementById("nav-menu");

  // Add event listener for theme toggling (light/dark mode).
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    // Save the new theme state to localStorage.
    const newTheme = document.body.classList.contains("theme-dark")
      ? "dark"
      : "light";
    localStorage.setItem("theme", newTheme);
    window.appData.settings.theme = newTheme;
  });

  // Add event listener for increasing text size.
  sizeIncreaseBtn.addEventListener("click", () => {
    let currentSize = window.appData.settings.textSize;
    // Increase text size by 10% up to a maximum of 200%.
    if (currentSize < 2) {
      currentSize = Math.min(2, currentSize + 0.1);
      applyTextSize(currentSize);
    }
  });

  // Add event listener for decreasing text size.
  sizeDecreaseBtn.addEventListener("click", () => {
    let currentSize = window.appData.settings.textSize;
    // Decrease text size by 10% down to a minimum of 90%.
    if (currentSize > 0.9) {
      currentSize = Math.max(0.9, currentSize - 0.1);
      applyTextSize(currentSize);
    }
  });

  // Event listeners for the vocabulary panel.
  vocabCloseBtn.addEventListener("click", () => {
    vocabPanel.hidden = true;
  });

  // Event listener for mobile menu.
  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", !isExpanded);
      navMenu.classList.toggle("expanded", !isExpanded);
    });
  }

  // Function to handle keyboard-based drag-and-drop.
  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    // Check if the active element is a drag-and-drop item.
    if (
      activeElement &&
      activeElement.classList.contains("match-item") &&
      e.key === " "
    ) {
      e.preventDefault();
      // Simulate drag with spacebar.
      if (activeElement.getAttribute("aria-grabbed") === "true") {
        // Drop the item.
        const target = document.querySelector(
          '.target-item[data-drop-target][aria-dropeffect="move"]'
        );
        if (target) {
          // Trigger the drop logic.
          const event = new CustomEvent("drop", {
            detail: { keyboard: true, source: activeElement },
            bubbles: true,
            cancelable: true,
          });
          target.dispatchEvent(event);
        }
        activeElement.setAttribute("aria-grabbed", "false");
      } else {
        // Grab the item.
        activeElement.setAttribute("aria-grabbed", "true");
      }
    }
  });
}

/**
 * Applies the current text size setting to the document.
 * @param {number} size The text size multiplier.
 */
function applyTextSize(size) {
  document.documentElement.style.fontSize = `${size}rem`;
  localStorage.setItem("textSize", size);
  window.appData.settings.textSize = size;
}

/**
 * Applies all saved settings (theme, text size, contrast).
 * @param {Object} settings The settings object.
 */
export function applySettings(settings) {
  document.body.className = "";
  if (settings.theme === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-light");
  }
  if (settings.highContrast) {
    document.body.classList.add("high-contrast");
  }
  applyTextSize(settings.textSize);
}
