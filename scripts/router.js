// scripts/router.js
import { renderHome, renderTopicPage } from "./quiz.js";

// Definer ruter
const routes = {
  "": () => renderHome(),              // "#/" eller tom hash
  "tema": (id) => renderTopicPage(id), // "#/tema/1"
};

export function handleRouteChange() {
  // Eksempel hash: "#/tema/1"
  const raw = window.location.hash || "#/";
  const cleaned = raw.slice(1).replace(/^\/+/, ""); // "tema/1" eller ""
  const [path, param] = cleaned.split("/");

  if (Object.prototype.hasOwnProperty.call(routes, path)) {
    routes[path](param);
  } else if (!path) {
    routes[""]();
  } else {
    routes[""]();
  }

  updateActiveLink("#/" + cleaned);
}

export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

function updateActiveLink(currentHash) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((a) => {
    a.classList.remove("active");
    a.removeAttribute("aria-current");
    if (a.getAttribute("href") === currentHash) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
}
