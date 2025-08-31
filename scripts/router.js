// scripts/router.js
import { renderTopicPage, renderHome } from "./quiz.js";

// Ruter vi støtter
const routes = {
  "": renderHome,          // hjem
  "tema": renderTopicPage, // tema/:id
};

export function handleRouteChange() {
  // Eksempler:
  // "#/tema/1" -> raw "/tema/1" -> cleaned "tema/1"
  // "#/"       -> cleaned ""     -> path "" (home)
  const raw = window.location.hash.slice(1);
  const cleaned = raw.replace(/^\/+/, ""); // fjern ledende "/"
  const [path = "", param = ""] = cleaned.split("/");

  let matched = false;
  if (Object.prototype.hasOwnProperty.call(routes, path)) {
    // kall riktig handler
    routes[path](param);
    matched = true;
  }

  if (!matched) {
    // fallback til hjem
    routes[""]();
  }

  // marker aktiv lenke i menyen
  updateActiveLink("#/" + cleaned);
}

export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
  // sikre at hash finnes for hjem
  if (!window.location.hash) {
    window.location.hash = "#/";
  }
}

function updateActiveLink(hash) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const isActive = link.getAttribute("href") === hash;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
