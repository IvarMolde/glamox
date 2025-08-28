/**
 * Loads the topic data from the JSON file.
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
