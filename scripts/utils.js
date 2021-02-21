export const scrollbar = Scrollbar.init(
  document.querySelector('#my-scrollbar'),
  {
    damping: 0.1,
    renderByPixels: true,
    continuousScrolling: true,
    alwaysShowTracks: true,
  }
)

export const scrollbarPages = Scrollbar.init(
  document.querySelector('#pagesScrollbar'),
  {
    damping: 0.1,
    renderByPixels: true,
    continuousScrolling: true,
    alwaysShowTracks: true,
  }
)

export const _stringToHTML = (str, elementType) => {
  const fragment = elementType
    ? document.createElement(elementType)
    : document.createDocumentFragment()
  const parser = new DOMParser()
  const doc = parser.parseFromString(str, 'text/html')
  ;[...doc.body.children].forEach(element => fragment.appendChild(element))
  return fragment
}

export const _openModal = el => {
  document.body.style.overflow = 'hidden'
  el.style.display = 'flex'
  setTimeout(() => {
    el.style.opacity = '1'
  }, 0)
}

export const _closeModal = el => {
  document.body.style.overflow = 'unset'
  el.style.opacity = '0'
  setTimeout(() => {
    el.style.display = 'none'
  }, 300)
}
