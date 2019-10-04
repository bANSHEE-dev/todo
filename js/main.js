class Render {
  renderTask(task) {
    console.log(task);
  }
}

class AbstractStore {
  getTask(id) {
    throw new Error('not implemented');
  }

  getTasks() {
    throw new Error('not implemented');
  }

  saveTask(task) {
    throw new Error('not implemented');
  }
}

class StoreLS extends AbstractStore {
  constructor() {
    super();
    this._prefix = 'strLS';
  }

  getTask(id) {
    const key = `${this._prefix}${id}`;
    const taskJson = localStorage.getItem(key);

    if (!taskJson) {
      throw new Error(`there is no task with id=${id}`);
    }
    return Promise.resolve(Task.fromJSON(taskJson));
  }

  getTasks() {
    const tasks = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      if (key.includes(this._prefix)) {
        let task = null;
        try {
          task = Task.fromJSON(localStorage.getItem(key));
        } catch (error) {
          throw new Error(`impossible get task with id=${id}`, error.message);
        }
        tasks.push(task);
      }
    }
    return Promise.resolve(tasks);
  }

  saveTask(task) {
    const key = `${this._prefix}${task.id}`;
    const json = Task.toJSON(task);
    localStorage.setItem(key, json);

    return Promise.resolve(task.copy());
  }

}

class Store extends AbstractStore {
  constructor() {
    super()
    this._storage = [];
  }


  getTask(id) {
    const task = this._srorage.find(task => task.id === id);
    if (!task) {
      throw new Error('there is no task with id=${id}');
    }
    return Promise.resolve(task.copy());
  }



  getTasks() {
    return Promise.resolve(
      this._storage.map(task => task.copy())
    );
  }

  saveTask(task) {
    this._storage.push(task);
    return Promise.resolve(task.copy());
  }

  async updateTask(task) {
    await this.deleteTask(task.id);
    return this.saveTask(task);
  }

  deleteTask(id) {
    const currentTask = this.getTask(id);
    this._storage = this._storage.filter(task => task.id !== currentTask.id);
    return Promise.resolve(currentTask.copy());
  }
}

class Task {
  get id() {
    return this._id;
  }

  get title() {
    return this._title;
  }

  get isDone() {
    return this._isDone;
  }

  get creationMoment() {
    return this._creationMoment;
  }

  constructor(
    id,
    title,
    isDone = false,
    creationMoment = Date.now()
  ) {
    this._id = id;
    this._title = title;
    this._isDone = isDone;
    this._creationMoment = creationMoment;
  }

  toggle() {
    this._isDone = !this._isDone;
  }

  copy() {
    return new Task(
      this.id,
      this.title,
      this.isDone,
      this.creationMoment
    );
  }

  static toJSON(task) {
    return JSON.stringify({
      id: task.id,
      title: task.title,
      isDone: task.isDone,
      creationMoment: task.creationMoment,
    })
  }

  static fromJSON(json) {
    let obj = null;
    try {
      obj = JSON.parse(json);
    } catch (error) {
      throw new Error(`invalid json: ${json}`, error.message);
    }

    return new Task(
      obj.id,
      obj.title,
      obj.isDone,
      obj.creationMoment
    );
  }
}

class TaskManager {
  constructor(store) {

    if (!(store instanceof AbstractStore)) {
      throw new Error('store should implements AbstractStore interface ')
    }
    this._store = store;
  }

  getTasks() {
    return this._store.getTasks();
  }

  createTask(title) {
    const id = Math.random().toString(36).substr(2, 16);
    const task = new Task(id, title);
    return this._store.saveTask(task);
  }

  deleteTask(task) {
    return this._store.deleteTask(task);
  }

  toggleTask(task) {
    task.toggle();
    return this._store.updateTask(task);
  }
}


class TODO {
  constructor(taskManager, render) {
    this._taskManager = taskManager;
    this._render = render;
  }

  async init() {
    const tasks = await this._taskManager.getTasks();
    tasks.forEach(task => {
      this._render.renderTask(task);
    });
  }


  async deleteTask(task) {
    await this._taskManager.deleteTasks(task)
   this._taskManager.deleteTask(task)
    }
  
  async addTask(title) {
    const task = await
    this._taskManager.createTask(title);
    this._render.renderTask(task);
  }


  async toggleTask() {
    const task = await this._taskManager.getTasks(id)
    this._taskManager.toggleTask(task);
    this._render.updateTask(task);
  }
}

class TODOApp {
  execute() {


    const store = new Store();
    const taskManager = new TaskManager(store);

    const render = new Render();

    const todo = new TODO(taskManager, render);

    const titleInputRef = document.getElementById('title-input');
    const createTaskBtnRef = document.getElementById('create-btn');
    const debugBtnRef = document.getElementById('debug-btn');
    const deleteAllTasksBtnRef = document.getElementById('delete-btn');
    const toggleAllTasksBtnRef = document.getElementById('toggle-btn');

    createTaskBtnRef.addEventListener('click', () => {
      todo.addTask(titleInputRef.value);
    });

    debugBtnRef.addEventListener('click', () => {
      todo.init();
    });

    deleteAllTasksBtnRef.addEventListener('click', () => {
      todo.deleteTasks();
    });

    toggleAllTasksBtnRef.addEventListener('click', () => {
      todo.toggleTask();
    })

    todo.init();
  }
}


const app = new TODOApp();
app.execute();