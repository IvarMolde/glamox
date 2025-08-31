// scripts/router.js
import { renderHome, renderTopicPage } from "./quiz.js";

// Definer ruter
const routes = {
  "": () => renderHome(),           // "#/" eller tom hash
  "tema": (id) => renderTopicPage(id), // "#/tema/1"
};

export function handleRouteChange() {
  // Eksempel: "#/tema/1"
  const raw = window.location.hash || "#/";
  // Fjern "#", fjern ledende "/", og splitt
  const cleaned = raw.slice(1).replace(/^\/+/, "");   // "tema/1" eller ""
  const [path, param] = cleaned.split("/");           // path="tema", param="1"

  // Finn matching rute
  if (Object.prototype.hasOwnProperty.call(routes, path)) {
    routes[path](param);
  } else if (path === "" || typeof path === "undefined") {
    routes[""]();
  } else {
    // ukjent rute -> hjem
    routes[""]();
  }

  // Marker aktiv lenke i toppmenyen
  updateActiveLink("#/" + cleaned);
}

export function setupRouter(routeHandler) {
  // Kjør på hash-endring og første last
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
