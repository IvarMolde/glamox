// scripts/app.js
import { setupRouter, handleRouteChange } from "./router.js";
import { loadTopics, loadQuizzes } from "./data.js";
import { setupA11y, applySettings } from "./a11y.js";

function renderNavMenu(topics) {
  const navMenu = document.getElementById("nav-menu");
  if (!navMenu) return;

  if (!Array.isArray(topics) || topics.length === 0) {
    const emptyText =
      navMenu.dataset.emptyText || "Ingen tema er tilgjengelige akkurat nå.";
    navMenu.innerHTML = `<li class="nav-placeholder">${emptyText}</li>`;
    return;
  }

  navMenu.innerHTML = topics
    .map((topic, index) => {
      const routeIndex = index + 1;
      const displayId = topic?.id ?? routeIndex;
      const label = topic?.title ? `Tema ${displayId}: ${topic.title}` : `Tema ${displayId}`;
      return `<li><a href="#/tema/${routeIndex}" class="nav-link">${label}</a></li>`;
    })
    .join("");
}

async function initializeApp() {
  // 1) Last begge JSON-filer først
  let topics = [];
  let quizzes = [];
  try {
    [topics, quizzes] = await Promise.all([loadTopics(), loadQuizzes()]);
  } catch (err) {
    console.error("Feil ved lasting av data:", err);
  }

  // 2) Global app-tilstand
  window.appData = {
    topics: Array.isArray(topics) ? topics : [],
    quizzes: Array.isArray(quizzes) ? quizzes : [],
    settings: {
      theme: localStorage.getItem("theme") || "light",
      textSize: parseFloat(localStorage.getItem("textSize")) || 1,
      highContrast: localStorage.getItem("highContrast") === "true",
    },
    userProgress: JSON.parse(localStorage.getItem("userProgress")) || {},
  };

  // 3) Navigasjon
  renderNavMenu(window.appData.topics);

  // 4) Tilpass UI
  applySettings(window.appData.settings);
  setupA11y();

  // 5) Start router ETTER at data er klare
  setupRouter(handleRouteChange);

  // 6) Initial rute
  handleRouteChange();
}

document.addEventListener("DOMContentLoaded", initializeApp);
