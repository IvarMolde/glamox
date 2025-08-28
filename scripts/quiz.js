import { saveUserProgress, getUserProgress } from "./storage.js";

// The main application container where content is rendered.
const appContainer = document.getElementById("app-container");
const vocabPanel = document.getElementById("vocab-panel");
const vocabContent = document.getElementById("vocab-content");

/**
 * Renders the home page.
 */
export function renderHome() {
  const totalTopics = window.appData.topics.length;
  const progress = getUserProgress();
  const completedTopics = Object.values(progress).filter(
    (topic) => topic.completed
  ).length;

  appContainer.innerHTML = `
        <div class="content-area home-page">
            <header class="content-header">
                <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
                    <path d="M12 2L15 6L22 7L17 12L18 19L12 16L6 19L7 12L2 7L9 6L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h2>Velkommen til "Norsk på jobben"!</h2>
                <p>Her kan du lære norsk som du kan bruke på jobben hver dag.</p>
            </header>
            <div class="content-body">
                <h3>Din fremdrift</h3>
                <p>Du har fullført ${completedTopics} av ${totalTopics} temaer.</p>
                <div class="progress-bar" role="progressbar" aria-valuenow="${
                  (completedTopics / totalTopics) * 100
                }" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress" style="width: ${
                      (completedTopics / totalTopics) * 100
                    }%;"></div>
                </div>
                <div class="topic-list">
                    <h3>Gå til et tema:</h3>
                    <ul>
                        ${window.appData.topics
                          .map(
                            (topic, index) => `
                            <li>
                                <a href="#/tema/${
                                  index + 1
                                }" class="topic-link">
                                    Tema ${index + 1}: ${topic.title}
                                    ${
                                      progress[topic.id] &&
                                      progress[topic.id].completed
                                        ? " (Fullført)"
                                        : ""
                                    }
                                </a>
                            </li>
                        `
                          )
                          .join("")}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders a specific topic page, including the text and quizzes.
 * @param {string} topicId The ID of the topic to render.
 */
export function renderTopicPage(topicId) {
  const topicIndex = parseInt(topicId) - 1;
  const topic = window.appData.topics[topicIndex];
  const quizzes = window.appData.quizzes.find((q) => q.topicId === topic.id);

  if (!topic || !quizzes) {
    appContainer.innerHTML = "<p>Temaet ble ikke funnet.</p>";
    return;
  }

  // Render the topic text and quizzes.
  const topicHtml = `
        <div class="content-area topic-page">
            <header class="content-header">
                ${topic.icon}
                <h2>${topic.title}</h2>
                <p>Tema ${topicId}</p>
            </header>
            <div class="content-body">
                <p>${topic.text}</p>
                <div class="dialogue">
                    ${topic.dialogues
                      .map(
                        (d) => `<p><strong>${d.speaker}</strong>: ${d.text}</p>`
                      )
                      .join("")}
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
                    <div id="quiz-progress" class="progress" style="width: 0%;"></div>
                </div>
            </div>
        </div>
    `;

  // Render the vocabulary panel.
  const vocabHtml = `
        <ul class="word-list">
            ${topic.vocabulary
              .map(
                (v) => `<li><strong>${v.word}</strong>: ${v.explanation}</li>`
              )
              .join("")}
        </ul>
    `;

  appContainer.innerHTML = topicHtml;
  vocabContent.innerHTML = vocabHtml;
  vocabPanel.hidden = false;

  // Render the quizzes after the topic text is in the DOM.
  renderQuizzes(quizzes.tasks, topic.id);
}

/**
 * Renders all quizzes for a given topic.
 * @param {Array} tasks The array of quiz tasks.
 * @param {string} topicId The ID of the current topic.
 */
function renderQuizzes(tasks, topicId) {
  const quizContainer = document.getElementById("quiz-container");
  let userAttempts = getUserProgress()[topicId] || {
    scores: Array(tasks.length).fill(0),
    attempts: Array(tasks.length).fill(0),
  };

  const renderTask = (task, index) => {
    let taskHtml = `
            <div class="task-card" data-task-id="${index}">
                <h4>Oppgave ${index + 1}: ${task.type}</h4>
                <p>${task.question}</p>
                <div class="task-content">
        `;

    // Generate HTML based on task type.
    switch (task.type) {
      case "Leseforståelse":
        taskHtml += `
                    <form>
                        ${task.options
                          .map(
                            (option, i) => `
                            <label class="answer-option" for="task-${index}-option-${i}">
                                <input type="radio" id="task-${index}-option-${i}" name="answer" value="${option.value}" aria-label="${option.text}">
                                ${option.text}
                            </label>
                        `
                          )
                          .join("")}
                    </form>
                `;
        break;
      case "Match begrep-forklaring":
        taskHtml += `
                    <div class="match-container">
                        <ul class="match-list" role="listbox" aria-label="Begreper">
                            ${task.terms
                              .map(
                                (term, i) => `
                                <li class="match-item" role="option" tabindex="0" data-match-id="${term.id}" aria-label="Dra for å matche: ${term.text}" draggable="true">${term.text}</li>
                            `
                              )
                              .join("")}
                        </ul>
                        <ul class="target-list" aria-label="Forklaringer">
                            ${task.explanations
                              .map(
                                (explanation, i) => `
                                <li class="target-item" data-drop-target="${explanation.id}" aria-dropeffect="move" tabindex="0" aria-label="Slipp begrep her for å matche: ${explanation.text}">${explanation.text}</li>
                            `
                              )
                              .join("")}
                        </ul>
                    </div>
                `;
        break;
      case "Sorter rekkefølge":
        taskHtml += `
                    <ul class="sortable-list" role="listbox" aria-label="Trinn i produksjon">
                        ${task.items
                          .map(
                            (item, i) => `
                            <li class="sortable-item" role="option" tabindex="0" draggable="true" aria-label="Flyttbart element: ${item.text}">${item.text}</li>
                        `
                          )
                          .join("")}
                    </ul>
                `;
        break;
      case "Fyll-inn-tomrom":
        // For simplicity, we use input fields. The user will need to type the correct word.
        // A more advanced version could use a dropdown.
        const sentenceHtml = task.sentence.replace(
          /\[_\]/g,
          `<input type="text" class="cloze-input" aria-label="Fyll inn riktig ord">`
        );
        taskHtml += `<p>${sentenceHtml}</p>`;
        break;
      case "Dra-og-slipp":
        taskHtml += `
                    <div class="drag-drop-container">
                        <ul class="drag-list" aria-label="Riktige og feil rutiner">
                            ${task.items
                              .map(
                                (item, i) => `
                                <li class="drag-item" data-id="${i}" draggable="true" aria-grabbed="false" tabindex="0" aria-label="Dra-og-slipp element: ${item.text}">${item.text}</li>
                            `
                              )
                              .join("")}
                        </ul>
                        <div class="drop-zone" aria-label="Riktige rutiner slipp-sone" data-correct-zone="true">
                            <p>Dra de riktige rutinene hit</p>
                        </div>
                        <div class="drop-zone" aria-label="Feil rutiner slipp-sone" data-correct-zone="false">
                            <p>Dra de feile rutinene hit</p>
                        </div>
                    </div>
                `;
        break;
    }

    taskHtml += `
                </div>
                <div class="feedback-message" role="alert" aria-live="polite" hidden></div>
                <div class="button-group">
                    <button class="check-btn">Sjekk svar</button>
                    <button class="retry-btn" hidden>Prøv på nytt</button>
                    <button class="solution-btn" hidden>Vis fasit</button>
                </div>
            </div>
        `;
    quizContainer.innerHTML += taskHtml;
  };

  // Render each task.
  tasks.forEach(renderTask);

  // Add event listeners for each task card.
  document.querySelectorAll(".task-card").forEach((card) => {
    const checkBtn = card.querySelector(".check-btn");
    const retryBtn = card.querySelector(".retry-btn");
    const solutionBtn = card.querySelector(".solution-btn");
    const taskId = parseInt(card.dataset.taskId);

    // Function to check the user's answer.
    checkBtn.addEventListener("click", () => {
      const task = tasks[taskId];
      let isCorrect = false;

      switch (task.type) {
        case "Leseforståelse":
          const selected = card.querySelector('input[name="answer"]:checked');
          if (selected) {
            const selectedValue = selected.value;
            const correctOption = task.options.find((opt) => opt.isCorrect);
            isCorrect = selectedValue === correctOption.value;
          }
          break;
        case "Match begrep-forklaring":
          // Check if all items are matched correctly.
          const matches = card.querySelectorAll(".match-item");
          isCorrect = Array.from(matches).every((item) => {
            const dropTarget = card.querySelector(
              `[data-drop-target="${item.dataset.matchId}"]`
            );
            return dropTarget && dropTarget.contains(item);
          });
          break;
        case "Fyll-inn-tomrom":
          const inputs = card.querySelectorAll(".cloze-input");
          isCorrect = Array.from(inputs).every((input, i) => {
            return (
              input.value.trim().toLowerCase() ===
              task.correctAnswers[i].toLowerCase()
            );
          });
          break;
        case "Sorter rekkefølge":
          const sortedItems = Array.from(
            card.querySelectorAll(".sortable-item")
          );
          const itemOrder = sortedItems.map((item) => item.textContent.trim());
          isCorrect =
            JSON.stringify(itemOrder) ===
            JSON.stringify(task.correctOrder.map((co) => co.text));
          break;
        case "Dra-og-slipp":
          const correctDropZone = card.querySelector(
            '.drop-zone[data-correct-zone="true"]'
          );
          const correctItemsInZone = correctDropZone
            ? Array.from(correctDropZone.querySelectorAll(".drag-item"))
            : [];
          const allItemsInZone = Array.from(
            card.querySelectorAll(".drag-item")
          );

          // Check if the number of correct items in the drop zone matches the total correct items.
          const numCorrectItems = task.items.filter(
            (item) => item.isCorrect
          ).length;
          isCorrect = correctItemsInZone.length === numCorrectItems;
          if (isCorrect) {
            // Also check that no incorrect items are in the correct zone.
            isCorrect = correctItemsInZone.every(
              (item) => task.items[item.dataset.id].isCorrect
            );
          }
          break;
      }

      const feedbackEl = card.querySelector(".feedback-message");
      feedbackEl.hidden = false;

      if (isCorrect) {
        feedbackEl.textContent = "Riktig! Bra jobbet.";
        feedbackEl.classList.remove("feedback-incorrect");
        feedbackEl.classList.add("feedback-correct");
        userAttempts.scores[taskId] = 1;
        userAttempts.attempts[taskId] = 0; // Reset attempts on correct answer.
      } else {
        userAttempts.attempts[taskId]++;
        feedbackEl.textContent = "Feil. Prøv igjen!";
        feedbackEl.classList.remove("feedback-correct");
        feedbackEl.classList.add("feedback-incorrect");
      }

      // Update local storage progress.
      saveUserProgress(topicId, userAttempts);
      updateProgressBar();

      // Handle button visibility.
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
      // Reset the task state.
      userAttempts.attempts[taskId] = 0;
      saveUserProgress(topicId, userAttempts);
      // Re-render the task card to reset it visually.
      renderTask(tasks[taskId], taskId);
    });

    solutionBtn.addEventListener("click", () => {
      const feedbackEl = card.querySelector(".feedback-message");
      const task = tasks[taskId];
      let solutionText = "Fasit: ";

      switch (task.type) {
        case "Leseforståelse":
          const correctOption = task.options.find((opt) => opt.isCorrect);
          solutionText += correctOption.text;
          break;
        case "Fyll-inn-tomrom":
          solutionText += task.correctAnswers.join(", ");
          break;
        case "Sorter rekkefølge":
          solutionText += task.correctOrder
            .map((item) => item.text)
            .join(" -> ");
          break;
        case "Dra-og-slipp":
          const correctItems = task.items
            .filter((item) => item.isCorrect)
            .map((item) => item.text)
            .join(", ");
          solutionText += `Riktige rutiner er: ${correctItems}`;
          break;
        case "Match begrep-forklaring":
          solutionText =
            "Fasit: " +
            task.terms
              .map((term) => {
                const explanation = task.explanations.find(
                  (exp) => exp.id === term.id
                );
                return `${term.text} = ${explanation.text}`;
              })
              .join(", ");
          break;
      }
      feedbackEl.hidden = false;
      feedbackEl.textContent = solutionText;
      feedbackEl.classList.remove("feedback-correct");
      feedbackEl.classList.remove("feedback-incorrect");
    });
  });

  // Add drag-and-drop logic for relevant tasks.
  setupDragAndDrop();
  // Update progress bar on initial load.
  updateProgressBar();
}

/**
 * Updates the quiz progress bar on the current topic page.
 */
function updateProgressBar() {
  const topicId = window.location.hash.split("/")[2];
  const progress = getUserProgress()[topicId] || { scores: [], attempts: [] };
  const quizCount = window.appData.quizzes.find((q) => q.topicId === topicId)
    .tasks.length;

  let totalScore = progress.scores.reduce((sum, score) => sum + score, 0);
  const progressPercentage = (totalScore / quizCount) * 100;

  const progressBar = document.getElementById("quiz-progress");
  if (progressBar) {
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.parentElement.setAttribute("aria-valuenow", progressPercentage);
  }

  // Check if topic is completed and update global progress.
  if (totalScore === quizCount) {
    let globalProgress = getUserProgress();
    if (!globalProgress[topicId] || !globalProgress[topicId].completed) {
      globalProgress[topicId] = { ...globalProgress[topicId], completed: true };
      saveUserProgress(topicId, globalProgress[topicId]);
    }
  }
}

/**
 * Sets up drag-and-drop functionality for relevant task types.
 */
function setupDragAndDrop() {
  let draggedItem = null;
  let originalParent = null;

  document.querySelectorAll(".task-card").forEach((card) => {
    const dragItems = card.querySelectorAll('[draggable="true"]');
    const dropZones = card.querySelectorAll("[data-drop-target], .drop-zone");

    dragItems.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        draggedItem = e.target;
        originalParent = e.target.parentElement;
        e.dataTransfer.setData("text/plain", "dragged-item-id");
        e.dataTransfer.effectAllowed = "move";
      });

      item.addEventListener("dragend", () => {
        draggedItem = null;
        originalParent = null;
      });
    });

    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        // Check if a valid item is being dropped.
        if (
          draggedItem &&
          (e.target.classList.contains("target-item") ||
            e.target.classList.contains("drop-zone"))
        ) {
          e.target.appendChild(draggedItem);
        } else if (e.detail && e.detail.keyboard) {
          // Keyboard fallback
          const item = e.detail.source;
          e.target.appendChild(item);
        }
      });
    });
  });
}
