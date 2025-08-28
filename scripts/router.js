import { renderTopicPage, renderHome } from "./quiz.js";

// Ruter vi støtter
const routes = {
  "": renderHome,      // hjem
  "tema": renderTopicPage, // tema/:id
};

export function handleRouteChange() {
  // "#/tema/1" -> raw "/tema/1" -> cleaned "tema/1"
  const raw = window.location.hash.slice(1);
  const cleaned = raw.replace(/^\/+/, ""); // fjern ledende "/"
  const [path, param] = cleaned.split("/");

  let found = false;
  for (const route in routes) {
    if (path === route) {
      routes[route](param); // f.eks. "1"
      found = true;
      break;
    }
  }
  if (!found) renderHome();

  updateActiveLink("#/" + cleaned);
}

export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

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
