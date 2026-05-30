import { Storage } from "./storage.js";

document.addEventListener("click", (e) => {
  if (e.target.matches("p")) {
    const p = e.target;
    const input = document.createElement("input");

    input.value = p.textContent;
    input.className = "edit-input";

    p.replaceWith(input);
    input.focus();

    // input.addEventListener("blur", () => {
    //   const newP = document.createElement("p");
    //   newP.textContent = input.value;

    //   input.replaceWith(newP);
    // });
  }
});

class Task {
  constructor(title = "", description = "", status = "todo") {
    this.id = crypto.randomUUID(); // generate unique ID for each task
    this.title = title;
    this.description = description;
    this.status = status;
  }
}

const statuses = ["todo", "in-progress", "done"];

// takes Task Object and adds to the board

// load tasks from localStorage and add to the board on page load

document.addEventListener("DOMContentLoaded", () => {
  if (!Storage.size()) {
    // add when storage is empty (first time user) for demo purposes
    const task1 = new Task("Task 1", "This is the first task");
    const task2 = new Task("Task 2", "This is the second task", "in-progress");
    const task3 = new Task("Task 3", "This is the third task", "done");

    Storage.save(task1);
    Storage.save(task2);
    Storage.save(task3);
  }

  const tasks = Storage.load();
  tasks.forEach((task) => addTask(task));
});

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

  const p = document.createElement("p");
  p.textContent = task.description;

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

// adds Card with FLIP (First, Last, Invert, Play) animation technique to animate card movement
// pass startX/startY (cursor position) to animate in from cursor (for DnD drop)
// omit them for standard FLIP from old DOM position (for toggleStatus)
function animateCard(
  card,
  targetColumn,
  startX = "", // optional args for cursor-based animation
  startY = "",
) {
  const targetList = targetColumn.querySelector(".card-list");

  let deltaX, deltaY;

  if (startX && startY) {
    // ... if position is provided
    // Cursor-based: "First" is the cursor position (for DnD, D drop)
    // ? DnD stands for "drag and drop"

    targetList.appendChild(card); // Last
    const endRect = card.getBoundingClientRect();
    deltaX = startX - endRect.left; // Invert
    deltaY = startY - endRect.top; // Invert
  } else {
    // First
    const oldRect = card.getBoundingClientRect();
    // Last
    targetList.appendChild(card);
    // Invert
    const newRect = card.getBoundingClientRect();
    deltaX = oldRect.left - newRect.left;
    deltaY = oldRect.top - newRect.top;
  }

  if (deltaX === 0 && deltaY === 0) return; // if the card is in the correct position, no need to animate

  card.style.transition = "transform 0s"; // disable transition for the initial transform

  card.style.transform = `translate(${deltaX}px, ${deltaY}px)`; // Invert: place at old position

  // Play
  // wait for frame 1 to commit

  requestAnimationFrame(() => {
    card.style.transition = "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)"; // add transition for the animation
    card.style.transform = ""; // animate back to the original position
  });

  card.addEventListener(
    "transitionend",
    () => {
      card.style.transition = ""; // clean up transition after animation
    },
    { once: true },
  ); // ensure the event listener is removed after it runs once

  card.addEventListener(
    "transitioncancel",
    () => {
      card.style.transition = ""; // clean up transition after animation
    },
    { once: true },
  );
}

function removeCard(taskId) {
  const card = document.querySelector(`.card[data-id="${taskId}"]`);
  card.remove();
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

  // update status text and data attribute
  statusBtn.textContent = statuses[nextIndex];
  statusBtn.setAttribute("data-status", statuses[nextIndex]);

  // move the card to the correct column

  const card = statusBtn.closest(".card");
  Storage.update(card.dataset.id, { status: statuses[nextIndex] });

  if (targetColumn) {
    // update: added check to prevent errors if target column is not found
    animateCard(card, targetColumn);
  }
}

// e is the element clicked
document.querySelector(".board").addEventListener("click", (e) => {
  let statusBtn = e.target.closest("button.status");
  let deleteBtn = e.target.closest("button.card-delete");

  if (statusBtn) {
    toggleStatus(statusBtn.parentElement);
  }

  if (deleteBtn) {
    let card = deleteBtn.closest(".card");
    Storage.delete(card.dataset.id); // delete from storage using the card's data-id
    card.remove();
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

// add this before model closing
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

  Storage.save(task);
  addTask(task);

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
  Storage.update(draggedCard.dataset.id, { status: newStatus });
});
