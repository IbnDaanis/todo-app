class TodoList {
  #list
  constructor() {
    this.#list = JSON.parse(localStorage.getItem('TodoList')) || {}
  }

  saveList = () => {
    localStorage.setItem('TodoList', JSON.stringify(this.#list))
  }

  getList = () => {
    return Object.entries(this.#list).map(item => item[1])
  }

  filterList = query => {
    return this.getList().filter(item => item.title === query)
  }

  addTodo = todo => {
    this.#list[todo.id] = todo
    this.saveList()
    return this
  }

  removeTodo = id => {
    delete this.#list[id]
    this.saveList()
    return this
  }

  editTodo = (id, edited) => {
    this.#list[id] = { ...this.#list[id], ...edited }
    this.saveList()
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

  const _stringToHTML = (str, elementType) => {
    const fragment = elementType
      ? document.createElement(elementType)
      : document.createDocumentFragment()
    const parser = new DOMParser()
    const doc = parser.parseFromString(str, 'text/html')
    ;[...doc.body.children].forEach(element => fragment.appendChild(element))
    return fragment
  }

  const _todoElement = todo => {
    const element = _stringToHTML(
      `<div class='todo ${todo.isCompleted ? 'completed' : ''}'>
        <input type="checkbox" id="isComplete${todo.id}" name="isComplete"/>
        <label for="isComplete${todo.id}">${todo.title}</label>
        <button id='deleteButton'>Delete Todo</button>
       </div>`,
      'li'
    )

    element.querySelector(`#isComplete${todo.id}`).onclick = () => {
      list.editTodo(todo.id, { isCompleted: !todo.isCompleted })
      console.log(todo)
      addTodosToDOM()
    }

    element.querySelector('#deleteButton').onclick = () => {
      list.removeTodo(todo.id)
      addTodosToDOM()
    }

    return element
  }

  const addTodosToDOM = () => {
    todoContainer.innerHTML = ''
    list.getList().forEach(todo => {
      todoContainer.appendChild(_todoElement(todo))
    })
  }

  const addTodoFormSubmit = () => {
    return new Todo(addTodoForm['addTodo'].value)
  }

  addTodoForm.onsubmit = event => {
    event.preventDefault()
    list.addTodo(addTodoFormSubmit())
    addTodosToDOM()
    addTodoForm.reset()
  }

  return {
    addTodoForm,
    addTodosToDOM,
    addTodoFormSubmit,
  }
})()

DOM_EVENTS.addTodosToDOM()
