/**
 * Loads the topic data from the JSON file.
 * @returns {Promise<Array>} A promise that resolves with the topic data.
 */
export async function loadTopics() {
  try {
    const response = await fetch("./data/topics.json");
    if (!response.ok) {
      throw new Error("Could not load topics.json");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Loads the quiz data from the JSON file.
 * @returns {Promise<Array>} A promise that resolves with the quiz data.
 */
export async function loadQuizzes() {
  try {
    const response = await fetch("./data/quizzes.json");
    if (!response.ok) {
      throw new Error("Could not load quizzes.json");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Saves the user's progress for a specific topic to localStorage.
 * @param {string} topicId The ID of the topic.
 * @param {Object} progress An object containing scores and attempts.
 */
export function saveUserProgress(topicId, progress) {
  const savedProgress = JSON.parse(
    localStorage.getItem("userProgress") || "{}"
  );
  savedProgress[topicId] = progress;
  localStorage.setItem("userProgress", JSON.stringify(savedProgress));
  window.appData.userProgress = savedProgress; // Update global state
}

/**
 * Retrieves the user's progress from localStorage.
 * @returns {Object} The user's progress object.
 */
export function getUserProgress() {
  return JSON.parse(localStorage.getItem("userProgress") || "{}");
}
