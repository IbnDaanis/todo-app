class TodoList {
  #list
  constructor() {
    this.#list = {}
  }

  getList = () => this.#list

  addTodo = todo => {
    this.#list[todo.id] = todo
    return this
  }
  removeTodo = todo => {
    delete this.#list[todo.id]
    return this
  }
  editTodo = (todo, edited) => {
    this.#list[todo.id] = { ...this.#list[todo.id], ...edited }
    return this
  }
}

class Todo {
  constructor(title, isCompleted) {
    this.title = title
    this.isCompleted = isCompleted
    this.isDeleted = false
    this.id = Math.random().toString(36).substr(2, 9)
  }
}

const newTodo = new TodoList()
const first = new Todo('First', false)
const second = new Todo('Second', false)

console.log(
  newTodo
    .addTodo(first)
    .addTodo(second)
    .removeTodo(first)
    .editTodo(second, { isCompleted: true })
    .getList()
)
