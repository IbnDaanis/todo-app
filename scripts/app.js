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
  const modalForAddingTodo = document.querySelector('#modalForAddingTodo')
  const openAddTodoModal = document.querySelector('#openAddTodoModal')
  const todoContainer = document.querySelector('#todoContainer')
  const searchTodos = document.querySelector('#search')
  const modalForDeletingTodo = document.querySelector('#modalForDeletingTodo')
  const deleteTodoButton = document.querySelector('#deleteTodo')
  const pageNumbers = document.querySelector('#pageNumbers')
  const categorySelect = document.querySelector('#category')
  const categoryFilter = document.querySelector('#categoryFilter')
  const sort = document.querySelector('#sort')
  const sortMode = document.querySelector('#sortMode')
  const addTodoCategoryForm = document.querySelector('#addTodoCategoryForm')
  const addTodoCategoryButton = document.querySelector('#addTodoCategoryButton')
  const modalForTodoCategories = document.querySelector(
    '#modalForTodoCategories'
  )

  const todoList = new TodoList()

  let page = 0
  let category = null
  let query = null

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
    categorySelect.innerHTML = ''
    categoryFilter.innerHTML = ''

    const filterMessage = _stringToHTML(
      `<option value="">Filter by Category</option>`
    )

    categoryFilter.appendChild(filterMessage)

    categories.length < 1 &&
      categorySelect.appendChild(
        _stringToHTML(
          `<option value="">Add a category on the right =></option>`
        )
      )

    categories.forEach(category => {
      const option = _stringToHTML(
        `<option value="${category}">${category}</option>`
      )
      const option2 = option.cloneNode(true)

      if (isCategoryNew && category === categories[categories.length - 1]) {
        option.firstElementChild.selected = true
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
      category = target.value
      page = 0
      addTodosToDOM()
    }

    _closeModalEventListener(
      'addTodoCategory',
      'modalForTodoCategories',
      modalForTodoCategories
    )
  }

  const _addPageNumbers = (todos = todoList.getList().length) => {
    pageNumbers.innerHTML = ''
    const length = todos || 1

    for (let i = 0; i < length / 20; i++) {
      const button = document.createElement('button')
      button.textContent = i + 1

      i === page && (button.style.background = '#1e70eb')

      button.onclick = () => {
        page = i
        addTodosToDOM()

        setTimeout(() => {
          scrollbar.scrollIntoView(todoContainer.firstElementChild, {
            alignToTop: true,
            offsetBottom: 0,
          })
        }, 100)

        setTimeout(() => {
          scrollbarPages.scrollLeft = page * 27
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

  const _closeModalEventListener = (target1, target2, modal) => {
    document.body.addEventListener('click', ({ target }) => {
      if ([target1, target2].includes(target.id)) {
        _closeModal(modal)
        document.removeEventListener('click', _closeModal)
      }
    })
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

    _closeModalEventListener(
      'closeModal',
      'modalForDeletingTodo',
      modalForDeletingTodo
    )
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

  const options = {
    sorter: null,
    direction: 'ascending',
  }

  const addTodosToDOM = (todos = query || todoList.getList()) => {
    let todosToDisplay = todos.filter(todo =>
      category ? todo.category === category : true
    )

    const { sorter, direction } = options

    if (sorter) {
      if (sorter === 'category') {
        todosToDisplay = todosToDisplay.sort((a, b) =>
          a[sorter].localeCompare(b[sorter])
        )
      }

      if (sorter === 'date') {
        todosToDisplay = todosToDisplay.sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        )
      }

      if (direction === 'descending') {
        todosToDisplay = todosToDisplay.sort().reverse()
      }
    }

    todoContainer.innerHTML = ''

    todosToDisplay.length === 0 &&
      (todoContainer.innerHTML = '<h2>No todos to display</h2>')

    todosToDisplay.slice(page * 20, page * 20 + 20).forEach(todo => {
      todoContainer.appendChild(_todoElement(todo))
    })

    _addPageNumbers(todosToDisplay.length)
  }

  const createAddTodoForm = () => {
    openAddTodoModal.onclick = () => _openModal(modalForAddingTodo)
    _closeModalEventListener(null, 'modalForAddingTodo', modalForAddingTodo)
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
    query = null
    page = Math.ceil(todoList.getList().length / 20) - 1
    addTodosToDOM()
    setTimeout(() => {
      scrollbar.scrollIntoView(todoContainer.lastElementChild, {
        alignToTop: true,
        offsetBottom: 0,
      })
    }, 100)

    setTimeout(() => {
      scrollbarPages.scrollLeft = page * 48
    }, 100)

    _closeModal(modalForAddingTodo)

    addTodoForm.reset()
    addTodoForm['dueDate'].value = dateToday
  }

  const addTodoSorting = () => {
    sort.onchange = () => {
      options.sorter = sort.value
      page = 0
      sort.value ? (sortMode.disabled = false) : (sortMode.disabled = true)
      addTodosToDOM()
    }

    sortMode.onchange = () => {
      options.direction = sortMode.value
      page = 0
      addTodosToDOM()
    }
  }

  // for (let i = 0; i < 100; i++) {
  //   todoList.addTodo(new Todo(`Todo ${i}`, false, 'First'))
  // }

  // for (let i = 0; i < 100; i++) {
  //   todoList.addTodo(new Todo(`Todo Third ${i}`, false, 'Third'))
  // }

  searchTodos.oninput = ({ target }) => {
    page = 0

    query = todoList.filterList(target.value)

    addTodosToDOM()
  }

  return {
    addTodosToDOM,
    addTodoSorting,
    createAddTodoForm,
    createCategoryOptions,
  }
})()

DOM_EVENTS.addTodosToDOM()
DOM_EVENTS.addTodoSorting()
DOM_EVENTS.createAddTodoForm()
DOM_EVENTS.createCategoryOptions()
