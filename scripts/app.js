class TodoList {
  #list
  constructor() {
    this.#list = []
  }

  getList = () => this.#list
  addTodo = () => {
    this.list.push('Hello')
    return this
  }
}

const newTodo = new TodoList()

console.log(newTodo.getList())
