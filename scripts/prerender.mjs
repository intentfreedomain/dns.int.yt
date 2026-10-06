/**
 * Static prerender.
 *
 * Runs after `vite build`. For every route in src/data/site.js it server-renders
 * the app, then writes a complete HTML file with that markup plus the matching
 * <title>, description, canonical and JSON-LD. Also emits dist/404.html, which
 * is what GitHub Pages serves for a deep link — without it every route except
 * "/" is a hard 404.
 *
 * The head tags below are matched positionally (name/property before
 * content, rel before href), which is the shape index.html is written in.
 *
 * Usage: node scripts/prerender.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrEntry = join(root, '.ssr', 'entry-server.js')

if (!existsSync(ssrEntry)) {
  console.error(`[prerender] missing ${ssrEntry} — run "vite build --ssr" first`)
  process.exit(1)
}

// Dynamic imports need file:// URLs: a bare absolute path is not a valid
// specifier on Windows.
const load = (relative) => import(pathToFileURL(join(root, relative)).href)

const { render } = await import(pathToFileURL(ssrEntry).href)
const { ROUTES, SITE_URL, pageTitle } = await load('src/data/site.js')
const { graph } = await load('src/data/schema.js')

const template = readFileSync(join(dist, 'index.html'), 'utf8')
const jsonLd = `<script type="application/ld+json">${JSON.stringify(graph())}</script>`

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const setMeta = (html, attr, key, content) =>
  html.replace(
    new RegExp(`(<meta\\s+${attr}="${key}"[^>]*?content=")[^"]*(")`, 'i'),
    (_, before, after) => `${before}${escapeAttr(content)}${after}`,
  )

const setCanonical = (html, href) =>
  html.replace(
    /(<link\s+rel="canonical"[^>]*?href=")[^"]*(")/i,
    (_, before, after) => `${before}${escapeAttr(href)}${after}`,
  )

function page({ title, description, path, markup }) {
  const fullTitle = pageTitle(title)
  const canonical = `${SITE_URL}${path}`

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    () => `<title>${escapeAttr(fullTitle)}</title>`,
  )

  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:title', fullTitle)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', canonical)
  html = setMeta(html, 'name', 'twitter:title', fullTitle)
  html = setMeta(html, 'name', 'twitter:description', description)
  html = setCanonical(html, canonical)

  html = html.replace('</head>', () => `  ${jsonLd}\n  </head>`)
  return html.replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`)
}

for (const route of ROUTES) {
  const html = page({ ...route, markup: render(route.path) })
  const dir = route.path === '/' ? dist : join(dist, route.path.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
  const target = route.path === '/' ? 'dist/index.html' : `dist${route.path}/index.html`
  console.log(`[prerender] ${route.path} -> ${target}`)
}

// GitHub Pages serves 404.html for unmatched paths. It must hold the *shell*
// only: hydrating it with the homepage markup would flash the wrong page before
// the client router swapped in the real route.
writeFileSync(
  join(dist, '404.html'),
  template.replace('</head>', () => `  ${jsonLd}\n  </head>`),
)
console.log('[prerender] wrote dist/404.html (SPA fallback shell)')

// Sitemap generated from the same ROUTES array, so it cannot list a page that
// no longer exists — the previous hand-maintained copy pointed crawlers at
// /pricing, which 404s.
const urls = ROUTES.map((route) => `  <url><loc>${SITE_URL}${route.path}</loc></url>`).join('\n')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`[prerender] wrote dist/sitemap.xml (${ROUTES.length} urls)`)
