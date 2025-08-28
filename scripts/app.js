// scripts/app.js
import { setupRouter, handleRouteChange } from "./router.js";
import { loadTopics, loadQuizzes } from "./data.js";
import { setupA11y, applySettings } from "./a11y.js";

/**
 * Starter hele appen:
 *  - Laster data (topics + quizzes)
 *  - Setter brukerinnstillinger (tema, tekststørrelse, kontrast)
 *  - Setter opp tilgjengelighet (a11y)
 *  - Starter router og rendrer første visning
 */
async function initializeApp() {
  try {
    // 1) Last data
    const [topics, quizzes] = await Promise.all([loadTopics(), loadQuizzes()]);

    // 2) Global app-state (enkelt)
    window.appData = {
      topics: Array.isArray(topics) ? topics : [],
      quizzes: Array.isArray(quizzes) ? quizzes : [],
      settings: {
        theme: localStorage.getItem("theme") || "light",
        textSize: parseFloat(localStorage.getItem("textSize")) || 1,
        highContrast: localStorage.getItem("highContrast") === "true",
      },
      userProgress: JSON.parse(localStorage.getItem("userProgress") || "{}"),
    };

    // 3) Bruk lagrede innstillinger
    applySettings(window.appData.settings);

    // 4) Tilgjengelighet / UI-knapper (tema, tekststørrelse, meny)
    setupA11y();

    // 5) Router
    setupRouter(handleRouteChange);
    handleRouteChange(); // første render basert på hash
  } catch (err) {
    console.error("[initializeApp] Klarte ikke å starte appen:", err);
    const view = document.getElementById("content-view") || document.getElementById("app-container");
    if (view) {
      view.innerHTML = `
        <div class="content-area">
          <h2>Teknisk feil</h2>
          <p>Beklager, noe gikk galt under oppstart. Prøv å laste siden på nytt.</p>
        </div>
      `;
    }
  }
}

// Kjør når DOM er klar
document.addEventListener("DOMContentLoaded", initializeApp);
