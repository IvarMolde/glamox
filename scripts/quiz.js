import { saveUserProgress, getUserProgress } from "./storage.js";

// En liten helper for å hente elementer
const el = (id) => document.getElementById(id);
// Ren prosent uten NaN
const pct = (num, den) => (den > 0 ? (num / den) * 100 : 0);

/* =========================
   HJEM
   ========================= */
export function renderHome() {
 const view = el("content-view");
const vocabPanel = el("vocab-panel");
if (vocabPanel) vocabPanel.hidden = true;
view.innerHTML = `...`;
    <div class="content-area home-page">
      <header class="content-header">
        <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2L15 6L22 7L17 12L18 19L12 16L6 19L7 12L2 7L9 6L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2>Velkommen til "Norsk på jobben"!</h2>
        <p>Her kan du lære norsk som du kan bruke på jobben hver dag.</p>
      </header>
      <div class="content-body">
        <h3>Din fremdrift</h3>
        <p>Du har fullført ${completedTopics} av ${totalTopics} temaer.</p>
        <div class="progress-bar" role="progressbar" aria-valuenow="${pct(
          completedTopics,
          totalTopics
        )}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress" style="width:${pct(completedTopics, totalTopics)}%"></div>
        </div>

        <div class="topic-list">
          <h3>Gå til et tema:</h3>
          <ul>
            ${window.appData.topics
              .map(
                (topic, index) => `
              <li>
                <a href="#/tema/${index + 1}" class="topic-link">
                  Tema ${index + 1}: ${topic.title}
                  ${getUserProgress()[topic.id]?.completed ? " (Fullført)" : ""}
                </a>
              </li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   TEMA (TEKST + OPPGAVER)
   ========================= */
export function renderTopicPage(topicId) {
  const appContainer = el("app-container");
  const vocabPanel = el("vocab-panel");
  const vocabContent = el("vocab-content");

  const topicIndex = parseInt(topicId, 10) - 1;
  const topic = window.appData.topics[topicIndex];
  const quizzes = window.appData.quizzes.find((q) => String(q.topicId) === String(topic?.id));

  if (!topic || !quizzes) {
    appContainer.innerHTML = "<p>Temaet ble ikke funnet.</p>";
    if (vocabPanel) vocabPanel.hidden = true;
    return;
  }

  appContainer.innerHTML = `
    <div class="content-area topic-page">
      <header class="content-header">
        ${topic.icon || ""}
        <h2>${topic.title}</h2>
        <p>Tema ${topicId}</p>
      </header>

      <div class="content-body">
        <p>${topic.text}</p>

        <div class="dialogue">
          ${topic.dialogues.map((d) => `<p><strong>${d.speaker}</strong>: ${d.text}</p>`).join("")}
        </div>

        <h3>Grammatikkfokus</h3>
        <ul>
          ${topic.grammar.map((g) => `<li>${g}</li>`).join("")}
        </ul>
      </div>

      <div id="quiz-container" class="quiz-container">
        <h3>Oppgaver</h3>
        <p>Fullfør alle oppgavene for å fullføre temaet.</p>
        <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          <div id="quiz-progress" class="progress" style="width:0%"></div>
        </div>
      </div>
    </div>
  `;

  if (vocabContent && vocabPanel) {
    vocabContent.innerHTML = `
      <ul class="word-list">
        ${topic.vocabulary.map((v) => `<li><strong>${v.word}</strong>: ${v.explanation}</li>`).join("")}
      </ul>`;
    vocabPanel.hidden = false;
  }

  renderQuizzes(quizzes.tasks, topic.id);
}

/* =========================
   OPPGAVE-RENDERER + LOGIKK
   ========================= */
function renderQuizzes(tasks, topicId) {
  const quizContainer = document.getElementById("quiz-container");
  let userAttempts = getUserProgress()[topicId] || {
    scores: Array(tasks.length).fill(0),
    attempts: Array(tasks.length).fill(0),
  };

  // Bygg HTML for én oppgave
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
        html += `<p>${
          task.sentence.replace(
            /\[_\]/g,
            `<input type="text" class="cloze-input" aria-label="Fyll inn riktig ord">`
          )
        }</p>`;
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
            <div class="drop-zone" data-correct-zone="false"><p>Dra de feile rutinene hit</p></div>
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
        // Tegn akkurat dette kortet på nytt
        const html = renderTask(tasks[taskId], taskId);
        card.outerHTML = html;
        bindAllTaskListeners(); // rebind for nye elementer
        setupDragAndDrop();     // rebind DnD
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
  const quiz = window.appData.quizzes.find((q) => String(q.topicId) === topicId);
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
   DRAG & DROP
   ========================= */
function setupDragAndDrop() {
  let draggedItem = null;

  document.querySelectorAll(".task-card").forEach((card) => {
    const dragItems = card.querySelectorAll('[draggable="true"]');
    const dropZones = card.querySelectorAll("[data-drop-target], .drop-zone");

    dragItems.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        draggedItem = e.target;
        e.dataTransfer.setData("text/plain", "dragged-item");
        e.dataTransfer.effectAllowed = "move";
      });
      item.addEventListener("dragend", () => {
        draggedItem = null;
      });
    });

    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedItem) return;
        if (
          e.target.classList.contains("target-item") ||
          e.target.classList.contains("drop-zone")
        ) {
          e.target.appendChild(draggedItem);
        }
      });
    });
  });
}

