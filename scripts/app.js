import { setupRouter, handleRouteChange } from "./router.js";
import { loadTopics, loadQuizzes } from "./storage.js";
import { setupA11y, applySettings } from "./a11y.js";

/**
 * The main application entry point.
 * Initializes the app by loading data, setting up accessibility features,
 * and configuring the router.
 */
async function initializeApp() {
  // Load content and quizzes from JSON files.
  // This simulates a database for the static site.
  const topics = await loadTopics();
  const quizzes = await loadQuizzes();

  // Make the data globally accessible for other modules.
  // In a larger app, this would be a state management system.
  window.appData = {
    topics,
    quizzes,
    settings: {
      theme: localStorage.getItem("theme") || "light",
      textSize: parseFloat(localStorage.getItem("textSize")) || 1,
      highContrast: localStorage.getItem("highContrast") === "true",
    },
    userProgress: JSON.parse(localStorage.getItem("userProgress")) || {},
  };

  // Apply saved settings
  applySettings(window.appData.settings);

  // Set up accessibility and user interface interactions.
  setupA11y();

  // Set up the hash-based router.
  setupRouter(handleRouteChange);

  // Initial page load based on URL hash.
  handleRouteChange();
}

// Start the application when the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", initializeApp);
