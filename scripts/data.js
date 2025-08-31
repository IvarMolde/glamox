// scripts/data.js
async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Kunne ikke hente ${url} (HTTP ${res.status})`);
  return res.json();
}

export async function loadTopics() {
  try {
    return await fetchJSON("data/topics.json");
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function loadQuizzes() {
  try {
    return await fetchJSON("data/quizzes.json");
  } catch (err) {
    console.error(err);
    return [];
  }
}
