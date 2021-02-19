class Todo {
  constructor(title, dueDate, category) {
    this.title = title
    this.isCompleted = false
    this.dueDate = dueDate
    this.category = category
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
  const pageNumbers = document.querySelector('#pageNumbers')
  const categorySelect = document.querySelector('#category')
  const categoryFilter = document.querySelector('#categoryFilter')
  const addTodoCategoryForm = document.querySelector('#addTodoCategoryForm')
  const addTodoCategoryButton = document.querySelector('#addTodoCategoryButton')
  const modalForTodoCategories = document.querySelector(
    '#modalForTodoCategories'
  )

  const todoList = new TodoList()

  let page = 0

  const categories =
    [
      ...new Set(
        todoList
          .getList()
          .filter(item => item.category)
          .map(item => item.category)
      ),
    ] || []

  const dateToday = new Date().toISOString().split('T')[0]

  addTodoForm['dueDate'].value = dateToday
  addTodoForm['dueDate'].setAttribute('min', dateToday)

  const _createCategories = isCategoryNew => {
    console.log({ categories })
    categorySelect.innerHTML = ''
    categoryFilter.innerHTML = ''

    const filterMessage = document.createElement('option')
    filterMessage.textContent = 'Filter by Category'
    filterMessage.value = ''

    categoryFilter.appendChild(filterMessage)

    categories.forEach(category => {
      const option = document.createElement('option')
      option.textContent = category
      option.value = category

      const option2 = document.createElement('option')
      option2.textContent = category
      option2.value = category

      if (isCategoryNew && category === categories[categories.length - 1]) {
        option.selected = true
        option2.selected = true
      }

      categorySelect.appendChild(option)

      categoryFilter.appendChild(option2)
    })
  }

  const createCategoryOptions = () => {
    addTodoCategoryButton.onclick = () => _openModal(modalForTodoCategories)

    _createCategories(false)

    addTodoCategoryForm.onsubmit = event => {
      event.preventDefault()
      categories.push(addTodoCategoryForm['categoryInput'].value.trim())
      _createCategories(true)
      addTodoCategoryForm.reset()
    }

    categoryFilter.onchange = ({ target }) => {
      addTodosToDOM(todoList.getList(), target.value)
    }

    document.body.addEventListener('click', ({ target }) => {
      if (['addTodoCategory', 'modalForTodoCategories'].includes(target.id)) {
        _closeModal(modalForTodoCategories)
        document.removeEventListener('click', _closeModal)
      }
    })
  }

  const _addPageNumbers = (todos = todoList.getList().length) => {
    pageNumbers.innerHTML = ''

    const length = todos || 1

    for (let i = 0; i < length / 20; i++) {
      const button = document.createElement('button')
      button.textContent = i + 1

      button.onclick = () => {
        page = i
        addTodosToDOM()
        setTimeout(() => {
          scrollbar.scrollIntoView(todoContainer.firstElementChild, {
            alignToTop: true,
            offsetBottom: 0,
          })
        }, 100)
      }

      pageNumbers.appendChild(button)
    }
  }

  const _stringToHTML = (str, elementType) => {
    const fragment = elementType
      ? document.createElement(elementType)
      : document.createDocumentFragment()
    const parser = new DOMParser()
    const doc = parser.parseFromString(str, 'text/html')
    ;[...doc.body.children].forEach(element => fragment.appendChild(element))
    return fragment
  }

  const _openModal = el => {
    document.body.style.overflow = 'hidden'
    el.style.display = 'flex'
    setTimeout(() => {
      el.style.opacity = '1'
    }, 0)
  }

  const _closeModal = el => {
    document.body.style.overflow = 'unset'
    el.style.opacity = '0'
    setTimeout(() => {
      el.style.display = 'none'
    }, 300)
  }

  const _deleteTodoConfirmation = id => {
    _openModal(modalForDeletingTodo)

    deleteTodoButton.onclick = () => {
      todoList.removeTodo(id)
      _closeModal(modalForDeletingTodo)
      searchTodos.value
        ? addTodosToDOM(todoList.filterList(searchTodos.value))
        : addTodosToDOM()
    }

    document.body.addEventListener('click', ({ target }) => {
      if (['closeModal', 'modalForDeletingTodo'].includes(target.id)) {
        _closeModal(modalForDeletingTodo)
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

  const addTodosToDOM = (todos = todoList.getList(), filter = null) => {
    console.log(todos.slice(page * 20, page * 20 + 20))

    const todosToDisplay = todos
      .filter(todo => (filter ? todo.category === filter : true))
      .slice(page * 20, page * 20 + 20)

    todoContainer.innerHTML = ''

    todosToDisplay.length === 0 &&
      (todoContainer.innerHTML = '<h2>No todos to display</h2>')

    todosToDisplay.forEach(todo => {
      todoContainer.appendChild(_todoElement(todo))
    })

    filter
      ? _addPageNumbers(todosToDisplay.length)
      : _addPageNumbers(todos.length)
  }

  const addTodoFormSubmit = () =>
    new Todo(
      addTodoForm['addTodo'].value,
      addTodoForm['dueDate'].value,
      addTodoForm['category'].value
    )

  addTodoForm.onsubmit = event => {
    event.preventDefault()
    todoList.addTodo(addTodoFormSubmit())
    page = todoList.getList().length / 20 - 1
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
  //   todoList.addTodo(new Todo(`Todo ${i}`, false))
  // }

  searchTodos.oninput = ({ target }) => {
    addTodosToDOM(todoList.filterList(target.value))
    console.log(todoList.filterList(target.value).length)
  }

  return {
    addTodosToDOM,
    createCategoryOptions,
  }
})()

DOM_EVENTS.addTodosToDOM()
DOM_EVENTS.createCategoryOptions()
