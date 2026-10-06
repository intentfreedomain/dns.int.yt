import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll without the wrapper `<div>`.
 *
 * The previous `Reveal` component rendered its own element, which meant it
 * became the direct child of every grid and flex container on the site and
 * pushed the real card out of the layout slot — callers had to forward a
 * className just to keep the grid intact. This hook attaches the observer to
 * a container the page already owns and flips a class; CSS does the rest via
 * `.reveal-group.is-revealed > *`.
 */
export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -48px 0px' } = {}) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No observer, no animation: show the content rather than hide it.
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin])

  return [ref, revealed]
}
