// scripts/quiz.js
import { saveUserProgress, getUserProgress } from "./storage.js";

/* Helpers */
const el = (id) => document.getElementById(id);
const pct = (num, den) => (den > 0 ? (num / den) * 100 : 0);

/* =========================
   HJEM
   ========================= */
export function renderHome() {
  const view = el("content-view");
  const vocabPanel = el("vocab-panel");
  if (!view) return;

  if (vocabPanel) vocabPanel.hidden = true;

  const topics = Array.isArray(window.appData?.topics) ? window.appData.topics : [];
  const totalTopics = topics.length;
  const progress = getUserProgress();
  const completedTopics = Object.values(progress || {}).filter((t) => t?.completed).length;
  const progressPercent = pct(completedTopics, totalTopics);

  const splashLinks = [
    {
      title: "Energieffektive løsninger",
      description:
        "Utforsk hvordan Glamox reduserer energiforbruket gjennom lysstyring, sensorer og rådgivning.",
      href: "https://www.glamox.com/no/pbs/energibesparelse/",
      cta: "Se energitiltakene",
    },
    {
      title: "Bærekraft i fokus",
      description:
        "Les om satsningen vår på miljø, ansvarlige materialvalg og sirkulær økonomi i produksjonen.",
      href: "https://www.glamox.com/no/pbs/baerekraft/",
      cta: "Les om bærekraft",
    },
    {
      title: "Ressurssenter",
      description:
        "Finn guider, webinarer og referanser som holder deg oppdatert på fag og produkter.",
      href: "https://www.glamox.com/no/pbs/kunnskapssenter/",
      cta: "Åpne ressurssenteret",
    },
  ];

  const splashMarkup = splashLinks
    .map(
      (card) => `
        <article class="highlight-card">
          <h4>${card.title}</h4>
          <p>${card.description}</p>
          <a
            href="${card.href}"
            class="button-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${card.cta}
          </a>
        </article>
      `
    )
    .join("");

  view.innerHTML = `
    <div class="content-area home-page">
      <header class="content-header">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2L15 6L22 7L17 12L18 19L12 16L6 19L7 12L2 7L9 6L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
          <h2>Glamox Professional Building Solutions</h2>
          <p>Profesjonelle belysningsløsninger for næringsbygg.</p>
      </header>

      <div class="content-body">
          <section class="intro">
            <p>
              Glamox utvikler, produserer og leverer profesjonelle belysningsløsninger som
              forbedrer ytelse og trivsel i næringsbygg. Denne læringsressursen gir nye og
              erfarne medarbeidere et praktisk innblikk i prosessene, sikkerheten og
              kvalitetskravene i fabrikkene våre.
            </p>
            <p>
              Arbeid gjennom temaene for å styrke fagspråk, rutiner og samarbeid på tvers av
              linjene. Hver modul er koblet til konkrete arbeidsoppgaver i produksjonen.
            </p>
            <div class="video-wrap">
              <iframe
                src="https://www.youtube.com/embed/R8ZaRKoWR1s"
                title="Introduksjonsvideo"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          </section>

          <section class="brand-highlights" aria-label="Utforsk Glamox sine satsingsområder">
            <h3>Utforsk Glamox</h3>
            <div class="highlight-grid">
              ${splashMarkup}
            </div>
          </section>

          <section class="progress-section" aria-label="Din fremdrift">
            <h3>Din fremdrift</h3>
            <p>Du har fullført ${completedTopics} av ${totalTopics} temaer.</p>
            <div
              class="progress-bar"
              role="progressbar"
              aria-valuenow="${progressPercent}"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div class="progress" style="width:${progressPercent}%"></div>
            </div>
          </section>

          <section class="topic-list">
            <h3>Start på et tema</h3>
            <ul>
              ${
                topics.length
                    ? topics
                        .map((topic, index) => {
                          const routeIndex = index + 1;
                          const topicId = String(topic?.id ?? routeIndex);
                          const done = progress?.[topicId]?.completed;
                          return `
                            <li>
                              <a href="#/tema/${routeIndex}" class="topic-link">
                                <span class="topic-link__title">Tema ${topicId}</span>
                                <span class="topic-link__name">${topic.title}</span>
                                ${done ? '<span class="topic-link__status">Fullført</span>' : ""}
                              </a>
                            </li>
                          `;
                        })
                        .join("")
                  : '<li class="topic-link__empty">Ingen tema er publisert ennå.</li>'
              }
            </ul>
          </section>
      </div>
    </div>
  `;
}

/* =========================
   MEDIA BLOCKS (poster, icon-grid, etc.)
   ========================= */
function renderMediaBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  return blocks.map((block) => {
    switch (block.type) {
      case "poster":
        return `
          <div class="media-block poster-block">
            <h3>${block.title || ""}</h3>
            <img src="${block.image}" alt="${block.alt || ""}">
            ${block.caption ? `<p><em>${block.caption}</em></p>` : ""}
          </div>`;

      case "icon-grid":
        return `
          <div class="media-block icon-grid-block">
            <h3>${block.title || ""}</h3>
            ${block.intro ? `<p>${block.intro}</p>` : ""}
            <div class="icon-grid">
              ${(block.items || []).map((item) => `
                <div class="icon-item">
                  <img src="${item.icon}" alt="${item.title}">
                  <h4>${item.title}</h4>
                  <p>${item.desc}</p>
                </div>`).join("")}
            </div>
          </div>`;

      default:
        return "";
    }
  }).join("");
}

/* =========================
   TEMA (TEKST + OPPGAVER)
   ========================= */
export function renderTopicPage(topicId) {
  const view = document.getElementById("content-view");
  const vocabPanel = document.getElementById("vocab-panel");
  const vocabContent = document.getElementById("vocab-content");
  if (!view) return;

  // 1) Finn tema via index i URL (1-basert -> 0-basert)
  const idx = Number.parseInt(topicId, 10) - 1;
  const topics = Array.isArray(window.appData?.topics) ? window.appData.topics : [];
  const quizzes = Array.isArray(window.appData?.quizzes) ? window.appData.quizzes : [];
  const topic = topics[idx];

  if (!topic) {
    view.innerHTML = `<div class="content-area"><p>Temaet ble ikke funnet.</p></div>`;
    if (vocabPanel) vocabPanel.hidden = true;
    return;
  }

  // 2) Finn quiz som matcher temaets ID (begge som streng)
  const quiz = quizzes.find(q => String(q.topicId) === String(topic.id));

  // 3) Render tema-innhold
  view.innerHTML = `
    <div class="content-area topic-page">
      <header class="content-header">
        ${topic.icon || ""}
        <h2>${topic.title}</h2>
        <p>Tema ${topicId}</p>
      </header>

      <div class="content-body">
        ${topic.hero ? `
          <div class="hero-image">
            <img src="${topic.hero.src}" alt="${topic.hero.alt}">
          </div>
        ` : ""}

        <p>${topic.text}</p>

        ${renderMediaBlocks(topic.mediaBlocks || [])}

        <div class="dialogue">
          ${topic.dialogues.map(d => `<p><strong>${d.speaker}</strong>: ${d.text}</p>`).join("")}
        </div>

        <h3>Grammatikkfokus</h3>
        <ul>${topic.grammar.map(g => `<li>${g}</li>`).join("")}</ul>
      </div>

      <div id="quiz-container" class="quiz-container">
        <h3>Oppgaver</h3>
        ${quiz
          ? `<p>Fullfør alle oppgavene for å fullføre temaet.</p>
             <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
               <div id="quiz-progress" class="progress" style="width:0%"></div>
             </div>`
          : `<p>Ingen oppgaver er lagt inn for dette temaet ennå.</p>`}
      </div>
    </div>
  `;

  // 4) Ordliste-panelet for temaet
  if (vocabPanel && vocabContent) {
    vocabContent.innerHTML = `
      <ul class="word-list">
        ${topic.vocabulary.map(v => `<li><strong>${v.word}</strong>: ${v.explanation}</li>`).join("")}
      </ul>`;
    vocabPanel.hidden = false;
  }

  // 5) Render quizene (om de finnes)
  if (quiz && Array.isArray(quiz.tasks)) {
    renderQuizzes(quiz.tasks, String(topic.id));
  }
}


/* =========================
   OPPGAVE-RENDERER + LOGIKK
   ========================= */
function renderQuizzes(tasks, topicId) {
  const quizContainer = document.getElementById("quiz-container");
  if (!quizContainer) return;

  let userAttempts = getUserProgress()[topicId] || {
    scores: Array(tasks.length).fill(0),
    attempts: Array(tasks.length).fill(0),
  };

  const renderTask = (task, index) => {
    let html = `
      <div class="task-card" data-task-id="${index}">
        <h4>Oppgave ${index + 1}: ${task.type}</h4>
        <p>${task.question}</p>
        <div class="task-content">`;

    switch (task.type) {
      case "Leseforståelse":
        html += `<form>
          ${task.options
            .map(
              (option, i) => `
            <label class="answer-option" for="task-${index}-option-${i}">
              <input type="radio" id="task-${index}-option-${i}" name="answer" value="${option.value}" aria-label="${option.text}">
              ${option.text}
            </label>`
            )
            .join("")}
        </form>`;
        break;

      case "Match begrep-forklaring":
        html += `
          <div class="match-container">
            <ul class="match-list" role="listbox" aria-label="Begreper">
              ${task.terms
                .map(
                  (term) => `
                <li class="match-item" role="option" tabindex="0" data-match-id="${term.id}" draggable="true">${term.text}</li>`
                )
                .join("")}
            </ul>
            <ul class="target-list" aria-label="Forklaringer">
              ${task.explanations
                .map(
                  (ex) => `
                <li class="target-item" data-drop-target="${ex.id}" tabindex="0">${ex.text}</li>`
                )
                .join("")}
            </ul>
          </div>`;
        break;

      case "Sorter rekkefølge":
        html += `
          <ul class="sortable-list" role="listbox" aria-label="Trinn i produksjon">
            ${task.items
              .map(
                (item) => `
              <li class="sortable-item" role="option" tabindex="0" draggable="true">${item.text}</li>`
              )
              .join("")}
          </ul>`;
        break;

      case "Fyll-inn-tomrom":
        // Lag inputer
        html += `<p>${
          task.sentence.replace(
            /\[_\]/g,
            `<input type="text" class="cloze-input" aria-label="Fyll inn riktig ord">`
          )
        }</p>`;
        // Ordbank (valgfri)
        if (task.wordBank && task.wordBank.length > 0) {
          html += `
            <div class="word-bank" role="group" aria-label="Velg ord">
              ${task.wordBank.map((w) => `<button type="button" class="word-btn">${w}</button>`).join(" ")}
            </div>
          `;
        }
        break;

      case "Dra-og-slipp":
        html += `
          <div class="drag-drop-container">
            <ul class="drag-list" aria-label="Riktige og feil rutiner">
              ${task.items
                .map(
                  (item, i) => `
                <li class="drag-item" data-id="${i}" draggable="true" tabindex="0">${item.text}</li>`
                )
                .join("")}
            </ul>
            <div class="drop-zone" data-correct-zone="true"><p>Dra de riktige rutinene hit</p></div>
            <div class="drop-zone" data-correct-zone="false"><p>Dra de feil rutinene hit</p></div>
          </div>`;
        break;
    }

    html += `
        </div>
        <div class="feedback-message" role="alert" aria-live="polite" hidden></div>
        <div class="button-group">
          <button class="check-btn">Sjekk svar</button>
          <button class="retry-btn" hidden>Prøv på nytt</button>
          <button class="solution-btn" hidden>Vis fasit</button>
        </div>
      </div>`;
    return html;
  };

  // Tegn alle oppgaver i ett
  quizContainer.innerHTML = tasks.map((t, i) => renderTask(t, i)).join("");

  // Koble knapper/handlinger
  function bindAllTaskListeners() {
    document.querySelectorAll(".task-card").forEach((card) => {
      const checkBtn = card.querySelector(".check-btn");
      const retryBtn = card.querySelector(".retry-btn");
      const solutionBtn = card.querySelector(".solution-btn");
      const taskId = parseInt(card.dataset.taskId, 10);

      // Ordbank -> fyll inn i inputs (kun for "Fyll-inn-tomrom")
      const task = tasks[taskId];
      if (task?.type === "Fyll-inn-tomrom") {
        const wordBtns = card.querySelectorAll(".word-bank .word-btn");
        const inputs = card.querySelectorAll(".cloze-input");
        let fillIndex = 0;

        wordBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            if (inputs[fillIndex]) {
              inputs[fillIndex].value = btn.textContent.trim();
              inputs[fillIndex].focus();
              fillIndex = (fillIndex + 1) % inputs.length;
            }
          });
        });
      }

      checkBtn.addEventListener("click", () => {
        const task = tasks[taskId];
        let isCorrect = false;

        switch (task.type) {
          case "Leseforståelse": {
            const selected = card.querySelector('input[name="answer"]:checked');
            if (selected) {
              const correct = task.options.find((o) => o.isCorrect);
              isCorrect = selected.value === correct.value;
            }
            break;
          }
          case "Match begrep-forklaring": {
            const matches = card.querySelectorAll(".match-item");
            isCorrect = Array.from(matches).every((item) => {
              const dropTarget = card.querySelector(
                `[data-drop-target="${item.dataset.matchId}"]`
              );
              return dropTarget && dropTarget.contains(item);
            });
            break;
          }
          case "Fyll-inn-tomrom": {
            const inputs = card.querySelectorAll(".cloze-input");
            isCorrect = Array.from(inputs).every(
              (input, i) =>
                input.value.trim().toLowerCase() ===
                task.correctAnswers[i].toLowerCase()
            );
            break;
          }
          case "Sorter rekkefølge": {
            const sortedItems = Array.from(card.querySelectorAll(".sortable-item"));
            const itemOrder = sortedItems.map((li) => li.textContent.trim());
            isCorrect =
              JSON.stringify(itemOrder) ===
              JSON.stringify(task.correctOrder.map((co) => co.text));
            break;
          }
          case "Dra-og-slipp": {
            const correctZone = card.querySelector('.drop-zone[data-correct-zone="true"]');
            const inZone = correctZone ? Array.from(correctZone.querySelectorAll(".drag-item")) : [];
            const numCorrect = task.items.filter((it) => it.isCorrect).length;
            isCorrect =
              inZone.length === numCorrect &&
              inZone.every((it) => task.items[it.dataset.id].isCorrect);
            break;
          }
        }

        const feedbackEl = card.querySelector(".feedback-message");
        feedbackEl.hidden = false;

        if (isCorrect) {
          feedbackEl.textContent = "Riktig! Bra jobbet.";
          feedbackEl.classList.add("feedback-correct");
          feedbackEl.classList.remove("feedback-incorrect");
          userAttempts.scores[taskId] = 1;
          userAttempts.attempts[taskId] = 0;
        } else {
          userAttempts.attempts[taskId] = (userAttempts.attempts[taskId] || 0) + 1;
          feedbackEl.textContent = "Feil. Prøv igjen!";
          feedbackEl.classList.add("feedback-incorrect");
          feedbackEl.classList.remove("feedback-correct");
        }

        saveUserProgress(topicId, userAttempts);
        updateProgressBar();

        if (isCorrect) {
          checkBtn.hidden = true;
          solutionBtn.hidden = true;
          retryBtn.hidden = true;
        } else if (userAttempts.attempts[taskId] >= 2) {
          retryBtn.hidden = false;
          solutionBtn.hidden = false;
        }
      });

      retryBtn.addEventListener("click", () => {
        userAttempts.attempts[taskId] = 0;
        saveUserProgress(topicId, userAttempts);
        const html = renderTask(tasks[taskId], taskId);
        card.outerHTML = html;
        bindAllTaskListeners();
        setupDragAndDrop();
      });

      solutionBtn.addEventListener("click", () => {
        const feedbackEl = card.querySelector(".feedback-message");
        const task = tasks[taskId];
        let solutionText = "Fasit: ";

        switch (task.type) {
          case "Leseforståelse": {
            const correct = task.options.find((o) => o.isCorrect);
            solutionText += correct.text;
            break;
          }
          case "Fyll-inn-tomrom": {
            solutionText += task.correctAnswers.join(", ");
            break;
          }
          case "Sorter rekkefølge": {
            solutionText += task.correctOrder.map((it) => it.text).join(" -> ");
            break;
          }
          case "Dra-og-slipp": {
            const correctItems = task.items
              .filter((it) => it.isCorrect)
              .map((it) => it.text)
              .join(", ");
            solutionText += `Riktige rutiner er: ${correctItems}`;
            break;
          }
          case "Match begrep-forklaring": {
            solutionText += task.terms
              .map((term) => {
                const ex = task.explanations.find((e) => e.id === term.id);
                return `${term.text} = ${ex.text}`;
              })
              .join(", ");
            break;
          }
        }
        feedbackEl.hidden = false;
        feedbackEl.textContent = solutionText;
        feedbackEl.classList.remove("feedback-correct", "feedback-incorrect");
      });
    });
  }

  bindAllTaskListeners();
  setupDragAndDrop();
  updateProgressBar();
}

/* =========================
   FREMGANGSSTREK
   ========================= */
function updateProgressBar() {
  const topicId = String(window.location.hash.split("/")[2] || "");
  const progress = getUserProgress()[topicId] || { scores: [], attempts: [] };
  const quiz = (window.appData?.quizzes || []).find((q) => String(q.topicId) === topicId);
  const quizCount = quiz ? quiz.tasks.length : 0;

  const totalScore = (progress.scores || []).reduce((s, v) => s + (v || 0), 0);
  const progressPercentage = pct(totalScore, quizCount);

  const bar = document.getElementById("quiz-progress");
  if (bar) {
    bar.style.width = `${progressPercentage}%`;
    bar.parentElement.setAttribute("aria-valuenow", String(progressPercentage));
  }

  if (quizCount > 0 && totalScore === quizCount) {
    const gp = getUserProgress();
    gp[topicId] = { ...(gp[topicId] || {}), completed: true };
    saveUserProgress(topicId, gp[topicId]);
  }
}

/* =========================
   DRAG & DROP (match/drop + sortering)
   ========================= */
function setupDragAndDrop() {
  let draggedItem = null;

  document.querySelectorAll(".task-card").forEach((card) => {
    const dragItems = card.querySelectorAll('[draggable="true"]');
    const dropZones = card.querySelectorAll("[data-drop-target], .drop-zone");

    // Felles drag for match + drag-og-slipp
    dragItems.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        draggedItem = item;
        e.dataTransfer.setData("text/plain", "dragged-item");
        e.dataTransfer.effectAllowed = "move";
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", () => {
        draggedItem = null;
        item.classList.remove("dragging");
      });
    });

    // Drop-soner (match + drag-og-slipp)
    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        zone.classList.add("drop-target");
      });
      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drop-target");
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drop-target");
        if (!draggedItem) return;
        if (zone.classList.contains("target-item") || zone.classList.contains("drop-zone")) {
          zone.appendChild(draggedItem);
        }
      });
    });

    // Sortering innenfor samme UL for "Sorter rekkefølge"
    card.querySelectorAll(".sortable-list").forEach((list) => {
      list.addEventListener("dragenter", () => list.classList.add("drop-target"));
      list.addEventListener("dragleave", () => list.classList.remove("drop-target"));
      list.addEventListener("drop", () => list.classList.remove("drop-target"));
      list.addEventListener("dragend", () => list.classList.remove("drop-target"));

      list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterEl = getDragAfterElement(list, e.clientY);
        const dragging = list.querySelector(".sortable-item.dragging");
        if (!dragging) return;

        if (!afterEl) {
          list.appendChild(dragging);
        } else {
          list.insertBefore(dragging, afterEl);
        }
      });

      list.querySelectorAll(".sortable-item").forEach((item) => {
        item.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", "reorder");
          e.dataTransfer.effectAllowed = "move";
          item.classList.add("dragging");
        });
        item.addEventListener("dragend", () => {
          item.classList.remove("dragging");
        });
      });
    });
  });
}

function getDragAfterElement(container, y) {
  const candidates = [...container.querySelectorAll(".sortable-item:not(.dragging)")];
  return candidates.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}




