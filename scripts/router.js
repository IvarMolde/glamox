// scripts/data.js
// Laster topics.json og quizzes.json trygt, med gode feilmeldinger.
// Viktig: stier er relative til index.html på GitHub Pages.

async function loadJson(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[data] Klarte ikke å laste:", url, err);
    return null; // la kallene under håndtere null
  }
}

export async function loadTopics() {
  // Ligger i /data/topics.json
  const data = await loadJson("./data/topics.json");
  if (!Array.isArray(data)) {
    console.warn("[data] topics.json var tom/ugyldig – returnerer []");
    return [];
  }
  // Normaliser id til streng
  return data.map(t => ({ ...t, id: String(t.id) }));
}

export async function loadQuizzes() {
  // Ligger i /data/quizzes.json
  const data = await loadJson("./data/quizzes.json");
  if (!Array.isArray(data)) {
    console.warn("[data] quizzes.json var tom/ugyldig – returnerer []");
    return [];
  }
  // Normaliser topicId til streng
  return data.map(q => ({ ...q, topicId: String(q.topicId) }));
}
