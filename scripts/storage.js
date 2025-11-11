/**
 * Saves the user's progress for a specific topic to localStorage.
 * @param {string} topicId The ID of the topic.
 * @param {Object} progress An object containing scores and attempts.
 */
export function saveUserProgress(topicId, progress) {
  const savedProgress = JSON.parse(localStorage.getItem("userProgress") || "{}");
  savedProgress[topicId] = progress;
  localStorage.setItem("userProgress", JSON.stringify(savedProgress));
  if (window.appData) {
    window.appData.userProgress = savedProgress; // Update global state
  }
}

/**
 * Retrieves the user's progress from localStorage.
 * @returns {Object} The user's progress object.
 */
export function getUserProgress() {
  try {
    return JSON.parse(localStorage.getItem("userProgress") || "{}");
  } catch {
    return {};
  }
}
