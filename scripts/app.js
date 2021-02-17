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
  constructor(title) {
    this.title = title
    this.isCompleted = false
    this.id = Math.random().toString(36).substr(2, 9)
  }
}

const DOM_EVENTS = (() => {
  const list = new TodoList()
  const addTodoForm = document.querySelector('#addTodoForm')
  const todoContainer = document.querySelector('#todoContainer')

  const addTodosToDOM = () => {
    todoContainer.innerHTML = ''
    list.getList().forEach(todo => {
      const element = document.createElement('div')
      const text = document.createElement('p')
      text.textContent = todo.title
      const deleteButton = document.createElement('button')
      deleteButton.textContent = 'Delete Todo'
      deleteButton.onclick = () => {
        list.removeTodo(todo.id)
        addTodosToDOM()
      }

      element.appendChild(text)
      element.appendChild(deleteButton)
      todoContainer.appendChild(element)
    })
  }

  const addTodoFormSubmit = () => {
    return new Todo(addTodoForm['addTodo'].value)
  }

  for (let i = 0; i < 10; i++) {
    list.addTodo(new Todo(i, false))
  }
  addTodoForm.onsubmit = event => {
    event.preventDefault()
    list.addTodo(addTodoFormSubmit())
    addTodoForm.reset()
  }
  return {
    addTodoForm,
    addTodosToDOM,
    addTodoFormSubmit,
  }
})()

DOM_EVENTS.addTodosToDOM()
