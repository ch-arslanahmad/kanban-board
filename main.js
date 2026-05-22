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

task = new Task();

task.title = "NEW TASK";
task.description = "This is a new task added to the board.";

document.querySelector("button#add-task").addEventListener("click", () => {
  addTask(task);
});

document.querySelectorAll(".status").forEach((button) => {
  button.addEventListener("click", (e) => {
    toggleStatus(e.target.parentElement);
  });
});
