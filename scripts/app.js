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

import {
  scrollbar,
  scrollbarPages,
  _stringToHTML,
  _openModal,
  _closeModal,
  _alphabetical,
} from './utils.js'

const DOM_EVENTS = (() => {
  const addTodoForm = document.querySelector('#addTodoForm')
  const modalForAddingTodo = document.querySelector('#modalForAddingTodo')
  const openAddTodoModal = document.querySelector('#openAddTodoModal')
  const todoContainer = document.querySelector('#todoContainer')
  const searchTodos = document.querySelector('#search')
  const modalForDeletingTodo = document.querySelector('#modalForDeletingTodo')
  const deleteTodoButton = document.querySelector('#deleteTodo')
  const categorySelect = document.querySelector('#category')
  const categoryFilter = document.querySelector('#categoryFilter')
  const modalTodoCategories = document.querySelector('#modalTodoCategories')

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

  const addTodoCategoryFilter = document.querySelector('#addTodoCategoryFilter')
  addTodoCategoryFilter.onclick = () => _openModal(modalTodoCategories)

  const _closeModalEventListener = (target1, target2, modal) => {
    document.body.addEventListener('click', ({ target }) => {
      if ([target1, target2].includes(target.id)) {
        _closeModal(modal)
        document.removeEventListener('click', _closeModal)
      }
    })
  }

  const _addPageNumbers = (todos = todoList.getList().length) => {
    const pageNumbers = document.querySelector('#pageNumbers')
    pageNumbers.innerHTML = ''
    const length = todos || 1

    for (let i = 0; i < length / 20; i++) {
      const pageButton = _stringToHTML(
        `<button ${i === page && "style='background: #1e70eb'"}>${
          i + 1
        }</button>`
      )

      pageButton.firstElementChild.onclick = () => {
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

      pageNumbers.appendChild(pageButton)
    }
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

  const _todoModal = todo => {
    const modalForTodo = document.querySelector('#modalForTodo')
    const editTodoForm = document.querySelector('#editTodoForm')
    const todoTitle = document.querySelector('#todoTitle')
    const todoDueDate = document.querySelector('#todoDueDate')
    const isTodoComplete = document.querySelector('#isTodoComplete')
    const categoryEdit = document.querySelector('#categoryEdit')
    const addTodoCategoryEdit = document.querySelector('#addTodoCategoryEdit')

    todoTitle.value = todo.title
    todoDueDate.value = todo.dueDate
    isTodoComplete.checked = todo.isCompleted

    isTodoComplete.onchange = () => {
      todoList.editTodo(todo.id, { isCompleted: isTodoComplete.checked })
    }

    addTodoCategoryEdit.onclick = () => _openModal(modalTodoCategories)

    editTodoForm.onsubmit = event => {
      event.preventDefault()
      todoList.editTodo(todo.id, {
        title: todoTitle.value,
        isCompleted: isTodoComplete.checked,
        dueDate: todoDueDate.value,
        category: categoryEdit.value,
      })
      searchTodos.value
        ? addTodosToDOM(todoList.filterList(searchTodos.value))
        : addTodosToDOM()

      _closeModal(modalForTodo)
    }

    _openModal(modalForTodo)
    _closeModalEventListener(null, 'modalForTodo', modalForTodo)
  }

  const _todoElement = todo => {
    const element = _stringToHTML(
      `<li class='todo ${todo.isCompleted ? 'completed' : ''}'>
        <label for="isComplete${todo.id}" class='container' title="Edit Todo: ${
        todo.title
      }">${todo.title}
        <input type="checkbox" id="isComplete${todo.id}" name="isComplete" ${
        todo.isCompleted && "checked='checked'"
      }" disabled>
        <span class="checkmark" id="checkmark${
          todo.id
        }" title="Toggle Todo Completion"></span>
        </label>
        <button id='deleteButton${todo.id}'>Delete</button>
       </li>`
    )

    element.firstElementChild.onclick = ({ target }) => {
      target.nodeName !== 'BUTTON' &&
        !target.classList.contains('checkmark') &&
        _todoModal(todo)
      todoList.editTodo(todo.id, { isCompleted: !todo.isCompleted })
    }

    element.querySelector(`#checkmark${todo.id}`).onclick = () => {
      todoList.editTodo(todo.id, { isCompleted: !todo.isCompleted })
      addTodosToDOM()
    }

    element.querySelector(`#deleteButton${todo.id}`).onclick = () => {
      _deleteTodoConfirmation(todo.id)
    }

    return element
  }

  const _createCategories = isCategoryNew => {
    const categoryEdit = document.querySelector('#categoryEdit')

    categoryEdit.innerHTML = ''
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
      const option3 = option.cloneNode(true)

      isCategoryNew &&
        category === categories[categories.length - 1] &&
        (option.firstElementChild.selected = true)

      categorySelect.appendChild(option)
      categoryFilter.appendChild(option2)
      categoryEdit.appendChild(option3)
    })
  }

  const createCategoryOptions = () => {
    const addTodoCategoryForm = document.querySelector('#addTodoCategoryForm')
    const addTodoCategoryButton = document.querySelector(
      '#addTodoCategoryButton'
    )
    addTodoCategoryButton.onclick = () => _openModal(modalTodoCategories)

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
      'modalTodoCategories',
      modalTodoCategories
    )
  }

  const sortOptions = {
    sorter: null,
    direction: 'ascending',
  }

  const addTodosToDOM = (todos = query || todoList.getList()) => {
    const todosToDisplay = todos.filter(todo =>
      category ? todo.category === category : true
    )
    const { sorter, direction } = sortOptions
    if (sorter) {
      switch (sorter) {
        case 'category':
          todosToDisplay.sort((a, b) => _alphabetical(a[sorter], b[sorter]))
        case 'date':
          todosToDisplay.sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
          )
      }
      direction === 'descending' && todosToDisplay.sort().reverse()
    }

    todoContainer.innerHTML = ''
    todosToDisplay.length === 0 &&
      (todoContainer.innerHTML = '<h2>No todos to display</h2>')
    todosToDisplay
      .slice(page * 20, page * 20 + 20)
      .forEach(todo => todoContainer.appendChild(_todoElement(todo)))
    _addPageNumbers(todosToDisplay.length)

    setTimeout(() => {
      scrollbarPages.scrollLeft = page * 27
    }, 100)
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

  const _resetFilterAndSearch = () => {
    const sort = document.querySelector('#sort')
    const sortMode = document.querySelector('#sortMode')
    query = null
    category = null
    search.value = ''
    sortOptions.sorter = null
    sortOptions.direction = 'ascending'
    sort.firstElementChild.selected = true
    sortMode.disabled = true
    sortMode.firstElementChild.selected = true
    categoryFilter.firstElementChild.selected = true
  }

  addTodoForm.onsubmit = event => {
    event.preventDefault()
    todoList.addTodo(addTodoFormSubmit())
    page = Math.ceil(todoList.getList().length / 20) - 1
    _resetFilterAndSearch()
    addTodosToDOM()
    setTimeout(() => {
      scrollbar.scrollIntoView(todoContainer.lastElementChild, {
        alignToTop: true,
        offsetBottom: 0,
      })
    }, 100)

    setTimeout(() => {
      scrollbarPages.scrollLeft = page * 27
    }, 100)

    _closeModal(modalForAddingTodo)

    setTimeout(() => {
      addTodoForm.reset()
      addTodoForm['dueDate'].value = dateToday
    }, 301)
  }

  const addTodoSorting = () => {
    const sort = document.querySelector('#sort')
    const sortMode = document.querySelector('#sortMode')

    const handleChange = () => {
      page = 0
      sortOptions.sorter = sort.value
      sortOptions.direction = sortMode.value
      sort.value ? (sortMode.disabled = false) : (sortMode.disabled = true)
      addTodosToDOM()
    }

    sort.onchange = () => handleChange()
    sortMode.onchange = () => handleChange()
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
