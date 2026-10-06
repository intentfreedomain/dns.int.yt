import '@testing-library/jest-dom/vitest'

// jsdom has no IntersectionObserver. The reveal hook and the terminal already
// fall back when it is missing, which is exactly what we want to exercise.
delete window.IntersectionObserver

// No matchMedia in jsdom either; the reduced-motion checks all guard on this.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })
}
