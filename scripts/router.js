import { renderTopicPage, renderHome } from "./quiz.js";

// Define the routes for the application.
const routes = {
  "": renderHome,
  "tema": renderTopicPage, // vi matcher bare 'tema' som path
};

/**
 * Handles the routing based on the URL hash.
 */
export function handleRouteChange() {
  const hash = window.location.hash.slice(1); // fjerner '#'
  const [path, param] = hash.split("/");

  let found = false;
  for (const route in routes) {
    if (path === route) {
      routes[route](param); // sender param (f.eks. "1")
      found = true;
      break;
    }
  }

  if (!found) {
    renderHome();
  }

  updateActiveLink(hash);
}

/**
 * Sets up the event listeners for the router.
 */
export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

/**
 * Updates the 'active' class on the navigation links.
 */
function updateActiveLink(hash) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + hash) {
      link.classList.add("active");
    }
  });
}

