/**
 * Loads the topic data from the JSON file.
 * @returns {Promise<Array>} A promise that resolves with the topic data.
 */
export async function loadTopics() {
  try {
    const response = await fetch("./topics.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load topics.json (HTTP ${response.status})`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[loadTopics]", error);
    return [];
  }
}

/**
 * Loads the quiz data from the JSON file.
 * @returns {Promise<Array>} A promise that resolves with the quiz data.
 */
export async function loadQuizzes() {
  try {
    const response = await fetch("./quizzes.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load quizzes.json (HTTP ${response.status})`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[loadQuizzes]", error);
    return [];
  }
}

/**
 * Saves the user's progress for a specific topic to localStorage.
 * @param {string} topicId The ID of the topic.
 * @param {Object} progress An object containing scores and attempts.
 */
export function saveUserProgress(topicId, progress) {
  const savedProgress = JSON.parse(localStorage.getItem("userProgress") || "{}");
  savedProgress[String(topicId)] = progress;
  localStorage.setItem("userProgress", JSON.stringify(savedProgress));
  // keep global in sync if present
  if (window.appData) window.appData.userProgress = savedProgress;
}

/**
 * Retrieves the user's progress from localStorage.
 * @returns {Object} The user's progress object.
 */
export function getUserProgress() {
  const raw = localStorage.getItem("userProgress");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
