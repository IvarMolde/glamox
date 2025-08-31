// scripts/app.js
import { setupRouter, handleRouteChange } from "./router.js";
import { loadTopics, loadQuizzes } from "./data.js";
import { setupA11y, applySettings } from "./a11y.js";

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

  // 3) Tilpass UI
  applySettings(window.appData.settings);
  setupA11y();

  // 4) Start router ETTER at data er klare
  setupRouter(() => handleRouteChange());
  handleRouteChange();
}

document.addEventListener("DOMContentLoaded", initializeApp);
