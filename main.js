class Task {
  constructor(title = "", description = "", status = "todo") {
    this.title = title;
    this.description = description;
    this.status = status;
  }
}

const statuses = ["todo", "in-progress", "done"];

// takes Task Object and adds to the board
function addTask(task) {
  console.log("Add Task button clicked");
  const board = document.querySelector(".board");

  const card = document.querySelector(".card").cloneNode(true);

  card.querySelector("h3").textContent = task.title;
  card.querySelector("p").textContent = task.description;

  const statusBtn = card.querySelector("button.status");

  statusBtn.textContent = task.status;
  statusBtn.setAttribute("data-status", task.status);

  board
    .querySelector(".column[data-status='" + task.status + "'] .card-list")
    .appendChild(card); // add the card to the correct column based on status
}

// adds Card with FLIP (First, Last, Invert, Play) animation technique to animate card movement
// pass startX/startY (cursor position) to animate in from cursor (for DnD drop)
// omit them for standard FLIP from old DOM position (for toggleStatus)
function animateCard(
  card,
  targetColumn,
  startX = null, // optional args for cursor-based animation
  startY = null,
) {
  const targetList = targetColumn.querySelector(".card-list");

  let deltaX, deltaY;

  if (startX !== null && startY !== null) {
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
  requestAnimationFrame(() => {
    // wait for frame 1 to commit

    requestAnimationFrame(() => {
      card.style.transition =
        "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)"; // add transition for the animation
      card.style.transform = ""; // animate back to the original position
    });
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

function toggleStatus(card_container) {
  const statusBtn = card_container.querySelector("button.status");

  const currentIndex = statuses.indexOf(statusBtn.getAttribute("data-status"));

  if (currentIndex === -1) {
    console.log("Invalid Value");
    return;
  }
  const nextIndex = (currentIndex + 1) % statuses.length;

  const targetColumn = document.querySelector(
    ".column[data-status='" + statuses[nextIndex] + "']",
  );

  statusBtn.textContent = statuses[nextIndex];
  statusBtn.setAttribute("data-status", statuses[nextIndex]);

  // move the card to the correct column

  const card = statusBtn.closest(".card");

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
    deleteBtn.closest(".card").remove();
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

  console.log(task);

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
});
