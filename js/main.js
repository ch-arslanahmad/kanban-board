import { TaskManager } from "./task-manager.js";

class Task {
  constructor(title = "", description = "", status = "todo") {
    this.id = crypto.randomUUID();
    this.title = title;
    this.description = description;
    this.status = status;
  }
}

const statuses = ["todo", "in-progress", "done"];

function createCard(task) {
  const card = document.createElement("div");
  card.draggable = true; // make the card draggable
  card.className = "card";
  card.dataset.id = task.id; // store task ID in data attribute for reference

  const header = document.createElement("div");
  header.className = "card-header";

  const statusBtn = document.createElement("button");
  statusBtn.className = "status";
  statusBtn.textContent = task.status;
  statusBtn.setAttribute("data-status", task.status);

  header.appendChild(statusBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "card-delete";
  const icon = document.createElement("i");
  icon.className = "fa-solid fa-trash";

  deleteBtn.appendChild(icon); // add icon to the delete button
  header.appendChild(deleteBtn);

  const content = document.createElement("div");
  content.className = "content";

  const h3 = document.createElement("h3");
  h3.textContent = task.title;
  h3.contentEditable = true;
  h3.addEventListener("blur", () => {
    const text = h3.textContent.trim();
    if (text !== "") {
      manager.update(card.dataset.id, { title: text });
      updateUndoButton();
    }
  });

  const p = document.createElement("p");
  p.textContent = task.description;
  p.contentEditable = true;
  p.addEventListener("blur", () => {
    const text = p.textContent.trim();
    if (text === "") {
      p.textContent = task.description;
    } else {
      manager.update(card.dataset.id, { description: text });
      updateUndoButton();
    }
  });

  content.appendChild(h3);
  content.appendChild(p);

  card.appendChild(header); // add header
  card.appendChild(content); // add content

  const targetList = document.querySelector(
    `.column[data-status="${task.status}"] .card-list`,
  );
  targetList.appendChild(card);
}

function addTask(task) {
  createCard(task);
}

function flip(el, fromRect, toRect) {
  const dx = fromRect.left - toRect.left;
  const dy = fromRect.top - toRect.top;
  if (dx === 0 && dy === 0) return;

  el.style.transition = "none";

  requestAnimationFrame(() => {
    el.style.transform = `translate(${dx}px, ${dy}px)`; // Jump to starting position

    requestAnimationFrame(() => {
      el.style.transition = "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = ""; // Animate back to final position
    });
  });

  el.addEventListener(
    "transitionend",
    () => {
      el.style.transition = "";
    },
    { once: true },
  );
  el.addEventListener(
    "transitioncancel",
    () => {
      el.style.transition = "";
    },
    { once: true },
  );
}

function animateCard(card, targetColumn, startX = "", startY = "") {
  const targetList = targetColumn.querySelector(".card-list");
  const fromRect =
    startX !== "" && startY !== ""
      ? { left: startX, top: startY }
      : card.getBoundingClientRect();

  targetList.appendChild(card);
  const toRect = card.getBoundingClientRect();

  flip(card, fromRect, toRect);
}

function removeCard(taskId) {
  const card = document.querySelector(`.card[data-id="${taskId}"]`);
  if (card) card.remove();
}

function toggleStatus(card_container) {
  const statusBtn = card_container.querySelector("button.status");
  const currentIndex = statuses.indexOf(statusBtn.getAttribute("data-status"));

  if (currentIndex === -1) {
    console.log("Invalid Value");
    return;
  }

  // ** Posibilities
  // Posibility#1: todo (1) -> in-progress(2)
  // Posibility#2: in-progress (2) -> done(3)
  // Posibility#3: done (3) -> todo(1)
  // possible via formula
  // nextIndex = (currentIndex + 1) % statuses.length
  // #1: (0 + 1) % 3 = 2
  // #2: (1 + 1) % 3 = 2
  // #3: (2 + 1) % 3 = 0

  const nextIndex = (currentIndex + 1) % statuses.length;
  const targetColumn = document.querySelector(
    ".column[data-status='" + statuses[nextIndex] + "']",
  );

  statusBtn.textContent = statuses[nextIndex];
  statusBtn.setAttribute("data-status", statuses[nextIndex]);

  const card = statusBtn.closest(".card");
  manager.update(card.dataset.id, { status: statuses[nextIndex] });
  updateUndoButton();

  if (targetColumn) {
    animateCard(card, targetColumn);
  }
}

const manager = new TaskManager();

document.addEventListener("DOMContentLoaded", () => {
  const tasks = manager.loadAll();
  if (tasks.length > 0) {
    tasks.forEach((t) => addTask(t));
    return;
  }

  [
    new Task("Task 1", "This is the first task"),
    new Task("Task 2", "This is the second task", "in-progress"),
    new Task("Task 3", "This is the third task", "done"),
  ].forEach((t) => {
    manager.add(t);
    addTask(t);
  });

  updateUndoButton();
});

document.querySelector(".board").addEventListener("click", (e) => {
  let statusBtn = e.target.closest("button.status");
  let deleteBtn = e.target.closest("button.card-delete");

  if (statusBtn) {
    toggleStatus(statusBtn.parentElement);
  }

  if (deleteBtn) {
    let card = deleteBtn.closest(".card");
    manager.delete(card.dataset.id);
    removeCard(card.dataset.id);
    updateUndoButton();
  }
});

// --- Modal Logic ---

const modal = document.querySelector(".task-modal");

document.querySelector("button#add-task").addEventListener("click", () => {
  modal.showModal();
});

document.getElementById("modal-cancel").addEventListener("click", () => {
  modal.close();
});

document.getElementById("modal-close").addEventListener("click", () => {
  modal.close();
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});

modal.addEventListener("close", () => {
  if (modal.returnValue === "" || modal.returnValue === undefined) return;

  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");

  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (title === "" || description === "") {
    return;
  }

  const task = new Task(title, description);
  manager.add(task);
  addTask(task);
  updateUndoButton();

  titleInput.value = "";
  descInput.value = "";
});

let draggedCard = null;

document.querySelector(".board").addEventListener("dragstart", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  draggedCard = card;
  card.classList.add("dragging");
});

document.querySelector(".board").addEventListener("dragend", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  card.classList.remove("dragging");
  draggedCard = null;
});

document.querySelector(".board").addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.querySelector(".board").addEventListener("drop", (e) => {
  e.preventDefault();
  const targetColumn = e.target.closest(".column");
  if (!targetColumn || !draggedCard) return;

  animateCard(draggedCard, targetColumn, e.clientX, e.clientY);

  const statusBtn = draggedCard.querySelector("button.status");
  const newStatus = targetColumn.getAttribute("data-status");
  statusBtn.textContent = newStatus;
  statusBtn.setAttribute("data-status", newStatus);
  manager.update(draggedCard.dataset.id, { status: newStatus });
  updateUndoButton();
});

document.getElementById("undo-task").addEventListener("click", () => {
  const state = manager.undo();
  if (!state) return;
  document.querySelectorAll(".card-list").forEach((l) => (l.innerHTML = ""));
  state.forEach((t) => addTask(t));
  updateUndoButton();
});

function updateUndoButton() {
  document.getElementById("undo-task").disabled = !manager.canUndo;
}

updateUndoButton();

// expose for console debugging
window.Task = Task;
window.manager = manager;
