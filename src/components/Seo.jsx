import { useEffect } from 'react'
import { ROUTES, SITE_URL, pageTitle } from '../data/site.js'

const OG_IMAGE = `${SITE_URL}/og.png`

/**
 * Per-page document metadata.
 *
 * Pages pass only the path: title and description come from ROUTES, the same
 * table scripts/prerender.mjs writes into the static HTML at build time. The
 * three real routes used to pass their own strings here, and all three had
 * drifted from what the crawler reads — hydration would silently rewrite the
 * head with different copy. Deriving both from one table makes that impossible.
 *
 * `title` and `description` are overrides for documents that have no ROUTES
 * entry: only the 404 page uses them, because it renders for any URL. Real
 * routes must not pass them, or the head splits back into two sources.
 *
 * The component still matters after the build: it keeps <title>, description
 * and canonical correct across soft client-side navigations, where no
 * prerendered document is loaded.
 */
export default function Seo({ path = '/', title, description }) {
  const route = ROUTES.find((r) => r.path === path)
  const fullTitle = pageTitle(title ?? route?.title)
  const content = description ?? route?.description

  useEffect(() => {
    document.title = fullTitle

    setMeta('description', content)

    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', content, 'property')
    setMeta('og:url', `${SITE_URL}${path}`, 'property')

    setCanonical(`${SITE_URL}${path}`)
  }, [fullTitle, content, path])

  return null
}

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

export { OG_IMAGE }
