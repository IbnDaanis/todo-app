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
    return this.getList().filter(item =>
      item.title.toLowerCase().includes(query.trim().toLowerCase())
    )
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
  const searchTodos = document.querySelector('#search')

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
      `<li class='todo ${todo.isCompleted ? 'completed' : ''}'>
        <label for="isComplete${todo.id}" class='container' title="${
        todo.title
      }">${todo.title}
        <input type="checkbox" id="isComplete${todo.id}" name="isComplete" ${
        todo.isCompleted && "checked='checked'"
      }">
        <span class="checkmark"></span>
        </label>
        <button id='deleteButton${todo.id}'>Delete</button>
       </li>`
    )

    element.querySelector(`#isComplete${todo.id}`).onclick = () => {
      list.editTodo(todo.id, { isCompleted: !todo.isCompleted })
      searchTodos.value
        ? addTodosToDOM(list.filterList(searchTodos.value))
        : addTodosToDOM()
    }

    element.querySelector(`#deleteButton${todo.id}`).onclick = () => {
      list.removeTodo(todo.id)
      searchTodos.value
        ? addTodosToDOM(list.filterList(searchTodos.value))
        : addTodosToDOM()
    }

    return element
  }

  const addTodosToDOM = (todos = list.getList()) => {
    todoContainer.innerHTML = ''
    todos.length === 0 &&
      (todoContainer.innerHTML = '<h2>No todos to display</h2>')
    todos.forEach(todo => {
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

  searchTodos.oninput = ({ target }) => {
    addTodosToDOM(list.filterList(target.value))
  }

  return {
    addTodosToDOM,
  }
})()

DOM_EVENTS.addTodosToDOM()
