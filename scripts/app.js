class TodoList {
  #list
  constructor() {
    this.#list = []
  }

  getList = () => this.#list
  addTodo = todo => {
    this.list.push(todo)
    return this
  }
  removeTodo = todo => {
    return this
  }
  editTodo = todo => {
    return this
  }
}

class Todo {
  constructor(title, isCompleted) {
    this.title = title
    this.isCompleted = isCompleted
    this.isDeleted = false
  }
}

const newTodo = new TodoList()
