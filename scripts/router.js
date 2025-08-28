import { renderTopicPage, renderHome } from "./quiz.js";

// Definer ruter
const routes = {
  "": renderHome,          // Hjem
  "tema/\\d+": renderTopicPage, // Tema/1, Tema/2, ...
};

/**
 * Håndter ruteendring basert på hash (#/...)
 */
export function handleRouteChange() {
  // Eksempler:
  // "#/tema/1" -> raw "/tema/1" -> cleaned "tema/1"
  // "#/"       -> raw "/"       -> cleaned ""
  const raw = window.location.hash.slice(1);
  const cleaned = raw.replace(/^\/+/, "");
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

/**
 * Sett opp lytter for hash-endringer
 */
export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

/**
 * Marker aktiv lenke i menyen + aria-current for tilgjengelighet
 */
function updateActiveLink(hash) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}
