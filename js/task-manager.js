import { Storage } from "./storage.js";

export class TaskManager {
  constructor() {
    this.history = []; // size is 1 after loading
    this.MAX_HISTORY = 20;
  }

  get canUndo() {
    return this.history.length >= 1;
  }

  get UndoSize() {
    return this.history.length;
  }

  #snapshot() {
    this.history.push(JSON.parse(JSON.stringify(Storage.load())));
    if (this.history.length > this.MAX_HISTORY) this.history.shift();
  }

  loadAll() {
    return Storage.load();
  }

  add(task) {
    this.#snapshot();
    Storage.save(task);
  }

  delete(id) {
    this.#snapshot();
    Storage.delete(id);
  }

  update(id, changes) {
    this.#snapshot();
    Storage.update(id, changes);
  }

  undo() {
    if (!this.canUndo) return null;
    const state = this.history.pop();
    Storage.overwrite(state);
    return state;
  }
}

// expose for console debugging
window.TaskManager = TaskManager;
