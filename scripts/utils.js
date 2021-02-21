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
