import { renderTopicPage, renderHome } from "./quiz.js";

// Define the routes for the application.
const routes = {
  "": renderHome,
  "tema/\\d+": renderTopicPage,
};

/**
 * Handles the routing based on the URL hash.
 * This function checks the current hash and calls the appropriate rendering function.
 */
export function handleRouteChange() {
  const hash = window.location.hash.slice(1);
  const [path, ...params] = hash.split("/");

  let found = false;
  for (const route in routes) {
    // Use a regular expression to match dynamic routes like 'tema/1', 'tema/2', etc.
    const regex = new RegExp(`^${route}$`);
    if (regex.test(path)) {
      // Call the corresponding rendering function with any parameters.
      routes[route](...params);
      found = true;
      break;
    }
  }

  // If no route matches, render the home page.
  if (!found) {
    renderHome();
  }

  // Update the active link in the navigation menu.
  updateActiveLink(hash);
}

/**
 * Sets up the event listeners for the router.
 * @param {Function} routeHandler The function to call when the hash changes.
 */
export function setupRouter(routeHandler) {
  window.addEventListener("hashchange", routeHandler);
}

/**
 * Updates the 'active' class on the navigation links based on the current URL hash.
 * @param {string} hash The current URL hash (e.g., '#/tema/1').
 */
function updateActiveLink(hash) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    // Remove the active class from all links.
    link.classList.remove("active");
    // Add the active class to the link that matches the current hash.
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
    }
  });
}
