class TodoList {
  #list
  constructor() {
    this.#list = {}
  }

  getList = () => {
    return Object.entries(this.#list).map(item => item[1])
  }

  filterList = query => {
    return this.getList().filter(item => item.title === query)
  }

  addTodo = todo => {
    this.#list[todo.id] = todo
    return this
  }

  removeTodo = id => {
    delete this.#list[id]
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
    this.id = Math.random().toString(36).substr(2, 9)
  }
}

const DOM_EVENTS = (() => {
  const addTodoForm = document.querySelector('#addTodoForm')
  const todoContainer = document.querySelector('#todoContainer')

  const addTodosToDOM = todos => {
    console.log({ todos })
    todoContainer.innerHTML = ''
    todos.forEach(todo => {
      const element = document.createElement('p')
      element.textContent = todo.title
      todoContainer.appendChild(element)
    })
  }

  const addTodoToDOM = event => {
    event.preventDefault()
    console.log(addTodoForm['addTodo'].value)
  }

  addTodoForm.onsubmit = event => addTodoToDOM(event)

  return {
    addTodosToDOM,
  }
})()

const newTodoList = new TodoList()

for (let i = 0; i < 10; i++) {
  newTodoList.addTodo(new Todo(i, false))
}
DOM_EVENTS.addTodosToDOM(newTodoList.getList())

console.log(newTodoList.getList())
