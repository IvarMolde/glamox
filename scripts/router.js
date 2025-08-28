import { renderTopicPage, renderHome } from "./quiz.js";

// Ruter vi støtter
const routes = {
  "": renderHome,   // hjem
  "tema": renderTopicPage, // tema/:id
};

/**
 * Håndter ruteendring basert på hash (#/...)
 */
export function handleRouteChange() {
  // Eksempler:
  // "#/tema/1" -> raw "/tema/1" -> cleaned "tema/1"
  // "#/"       -> raw "/"       -> cleaned ""
  const raw = window.location.hash.slice(1);
  const cleaned = raw.replace(/^\/+/, ""); // <-- viktig!
  const [path, param] = cleaned.split("/");

  let found = false;
  for (const route in routes) {
    if (path === route) {
      routes[route](param);
      found = true;
      break;
    }
  }

  if (!found) {
    renderHome();
  }

  updateActiveLink("#/" + cleaned); // <-- holder meny-lenker i sync
}

/** Lytt på hash-endring */
export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

/** Marker aktiv lenke i menyen */
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
