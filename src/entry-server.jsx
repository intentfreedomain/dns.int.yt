import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'

/**
 * Server render entry. Built separately by vite in SSR mode, then driven by
 * scripts/prerender.mjs to emit one static HTML file per route so crawlers and
 * link unfurlers get real markup instead of an empty <div id="root">.
 */
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
