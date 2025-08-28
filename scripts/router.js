import { renderTopicPage, renderHome } from "./quiz.js";

// Bruk capturing group for ID
const routes = {
  "": renderHome,
  "tema/(\\d+)": renderTopicPage, // match "tema/1", "tema/2", ...
};

export function handleRouteChange() {
  const raw = window.location.hash.slice(1); // f.eks. "/tema/1" eller ""
  const cleaned = raw.replace(/^\/+/, "");   // "tema/1" eller ""
  const [path, ...params] = cleaned.split("/");

  let found = false;
  for (const route in routes) {
    const regex = new RegExp(`^${route}$`);
    if (regex.test(path)) {
      routes[route](...params);
      found = true;
      break;
    }
  }

  if (!found) {
    renderHome();
  }

  updateActiveLink("#/" + cleaned);
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

