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

  editTodo = (id, edited) => {
    this.#list[id] = { ...this.#list[id], ...edited }
    console.log(edited)
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

  for (let i = 0; i < 10; i++) {
    list.addTodo(new Todo(`This is Todo #${i}`, false))
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
