import { renderTopicPage, renderHome } from "./quiz.js";

// Bruk capturing group for ID
const routes = {
  "": renderHome,
  "tema/(\\d+)": renderTopicPage, // match "tema/1", "tema/2", ...
};

export function handleRouteChange() {
  // Fjern leading slash fra hash: "#/tema/1" -> "tema/1"
  const normalized = window.location.hash.replace(/^#\/?/, ""); 

  let matched = false;
  for (const pattern in routes) {
    const regex = new RegExp(`^${pattern}$`);
    const m = normalized.match(regex);
    if (m) {
      // m[1], m[2], ... er captured params (f.eks. topicId)
      routes[pattern](...m.slice(1));
      matched = true;
      break;
    }
  }

  if (!matched) {
    renderHome();
  }

  updateActiveLink();
}

export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

function updateActiveLink() {
  const currentHash = window.location.hash || "#/"; // inkluder '#'
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === currentHash);
  });
}
