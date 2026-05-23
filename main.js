class Task {
  constructor(title = "", description = "", status = "todo") {
    this.title = title;
    this.description = description;
    this.status = status;
  }
}

// takes Task Object and adds to the board
function addTask(task) {
  console.log("Add Task button clicked");
  const board = document.querySelector(".board");

  const card = document.querySelector(".card").cloneNode(true);

  card.querySelector("h3").textContent = task.title;
  card.querySelector("p").textContent = task.description;
  card.querySelector("button.status").textContent = task.status;

  board.appendChild(card);
}

function toggleStatus(card_container) {
  statuses = ["todo", "in-progress", "done"];

  const statusBtn = card_container.querySelector("button.status");

  const currentIndex = statuses.indexOf(statusBtn.textContent);

  if (currentIndex === -1) {
    console.log("Invalid Value");
    return;
  }
  const nextIndex = (currentIndex + 1) % statuses.length;

  statusBtn.textContent = statuses[nextIndex];
  statusBtn.id = statuses[nextIndex];
}

document.querySelectorAll(".status").forEach((button) => {
  button.addEventListener("click", (e) => {
    toggleStatus(e.target.parentElement);
  });
});

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
