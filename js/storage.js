// a wrapper class over localStorage to handle Task specific storage needs (like saving/loading tasks, etc.)
export class Storage {
  static #key = "tasks"; // private field to store the key used for localStorage

  static save(task) {
    const tasks = Storage.load(); // load existing tasks
    tasks.push(task); // add new task to the list
    return localStorage.setItem(this.#key, JSON.stringify(tasks));
  }

  static delete(taskId) {
    const tasks = Storage.load();
    const updatedTasks = tasks.filter((task) => task.id !== taskId); // remove the task with the given ID
    return localStorage.setItem(this.#key, JSON.stringify(updatedTasks)); // save the updated list back to localStorage
  }

  static update(taskId, updatedTask) {
    const tasks = Storage.load();
    const index = tasks.findIndex((task) => task.id === taskId); // find the index of the task to update
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask }; // update the task with new values
      return localStorage.setItem(this.#key, JSON.stringify(tasks)); // save the updated list back to localStorage
    }
  }

  static load() {
    const tasks = localStorage.getItem(this.#key);
    return tasks ? JSON.parse(tasks) : [];
  }

  static size() {
    return Storage.load().length; // return the number of tasks stored in localStorage
  }

  static clear() {
    localStorage.removeItem(this.#key);
  }
}
