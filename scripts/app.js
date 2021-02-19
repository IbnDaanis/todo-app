class Todo {
  constructor(title, dueDate) {
    this.title = title
    this.isCompleted = false
    this.dueDate = dueDate
    this.id = Math.random().toString(36).substr(2, 9)
  }
}

class TodoList {
  constructor() {
    this.list = JSON.parse(localStorage.getItem('TodoList')) || {}
  }

  saveList = () => localStorage.setItem('TodoList', JSON.stringify(this.list))

  getList = () => Object.entries(this.list).map(item => item[1])

  filterList = query =>
    this.getList().filter(item =>
      item.title.toLowerCase().includes(query.trim().toLowerCase())
    )

  addTodo = todo => {
    this.list[todo.id] = todo
    this.saveList()
    return this
  }

  removeTodo = id => {
    delete this.list[id]
    this.saveList()
    return this
  }

  editTodo = (id, edited) => {
    this.list[id] = { ...this.list[id], ...edited }
    this.saveList()
    return this
  }
}

const DOM_EVENTS = (() => {
  const addTodoForm = document.querySelector('#addTodoForm')
  const todoContainer = document.querySelector('#todoContainer')
  const searchTodos = document.querySelector('#search')
  const modalForDeletingTodo = document.querySelector('#modalForDeletingTodo')
  const deleteTodoButton = document.querySelector('#deleteTodo')

  const todoList = new TodoList()

  const dateToday = new Date().toISOString().split('T')[0]

  addTodoForm['dueDate'].value = dateToday
  addTodoForm['dueDate'].setAttribute('min', dateToday)

  const _stringToHTML = (str, elementType) => {
    const fragment = elementType
      ? document.createElement(elementType)
      : document.createDocumentFragment()
    const parser = new DOMParser()
    const doc = parser.parseFromString(str, 'text/html')
    ;[...doc.body.children].forEach(element => fragment.appendChild(element))
    return fragment
  }

  const _openModal = () => {
    document.body.style.overflow = 'hidden'
    modalForDeletingTodo.style.display = 'flex'
    setTimeout(() => {
      modalForDeletingTodo.style.opacity = '1'
    }, 0)
  }

  const _closeModal = () => {
    document.body.style.overflow = 'unset'
    modalForDeletingTodo.style.opacity = '0'
    setTimeout(() => {
      modalForDeletingTodo.style.display = 'none'
    }, 300)
  }

  const _deleteTodoConfirmation = id => {
    _openModal()

    deleteTodoButton.onclick = () => {
      todoList.removeTodo(id)
      _closeModal()
      searchTodos.value
        ? addTodosToDOM(todoList.filterList(searchTodos.value))
        : addTodosToDOM()
    }

    document.body.addEventListener('click', ({ target }) => {
      if (['closeModal', 'modalForDeletingTodo'].includes(target.id)) {
        _closeModal()
        document.removeEventListener('click', _closeModal)
      }
    })
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
      todoList.editTodo(todo.id, { isCompleted: !todo.isCompleted })
      searchTodos.value
        ? addTodosToDOM(todoList.filterList(searchTodos.value))
        : addTodosToDOM()
    }

    element.querySelector(`#deleteButton${todo.id}`).onclick = () => {
      _deleteTodoConfirmation(todo.id)
    }

    return element
  }

  const addTodosToDOM = (todos = todoList.getList()) => {
    todoContainer.innerHTML = ''
    todos.length === 0 &&
      (todoContainer.innerHTML = '<h2>No todos to display</h2>')
    todos.forEach(todo => {
      todoContainer.appendChild(_todoElement(todo))
    })
  }

  const addTodoFormSubmit = () =>
    new Todo(addTodoForm['addTodo'].value, addTodoForm['dueDate'].value)

  addTodoForm.onsubmit = event => {
    event.preventDefault()
    todoList.addTodo(addTodoFormSubmit())
    addTodosToDOM()
    setTimeout(() => {
      scrollbar.scrollIntoView(todoContainer.lastElementChild, {
        alignToTop: true,
        offsetBottom: 0,
      })
    }, 100)
    addTodoForm.reset()
    addTodoForm['dueDate'].value = dateToday
  }

  // for (let i = 0; i < 100; i++) {
  //   list.addTodo(new Todo(i, false))
  // }

  searchTodos.oninput = ({ target }) => {
    addTodosToDOM(todoList.filterList(target.value))
  }

  return {
    addTodosToDOM,
  }
})()

DOM_EVENTS.addTodosToDOM()
