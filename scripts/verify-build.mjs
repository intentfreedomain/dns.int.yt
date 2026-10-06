/**
 * Post-build assertions.
 *
 * The site previously shipped a sitemap listing /pricing while /pricing
 * returned HTTP 404, and nothing caught it. This fails the build instead.
 *
 * Usage: node scripts/verify-build.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const load = (relative) => import(pathToFileURL(join(root, relative)).href)
const { ROUTES, SITE_URL, pageTitle } = await load('src/data/site.js')

const failures = []
const check = (label, condition) => {
  if (!condition) failures.push(label)
}

function htmlFor(route) {
  const file = route.path === '/' ? join(dist, 'index.html') : join(dist, route.path, 'index.html')
  return existsSync(file) ? readFileSync(file, 'utf8') : null
}

const tag = (html, pattern) => html.match(pattern)?.[1] ?? null

for (const route of ROUTES) {
  const html = htmlFor(route)
  const label = route.path

  check(`${label}: html file emitted`, html !== null)
  if (!html) continue

  check(`${label}: has a prerendered body`, /<div id="root">\S/.test(html))
  check(`${label}: has an h1`, /<h1[ >]/.test(html))
  check(`${label}: has a non-empty description`, /name="description"\s+content=".{40,}"/.test(html))

  // The headline and the tab must say the same thing. The title is built from
  // the same constant as the h1, so a mismatch means a hand-edit crept in.
  const expectedTitle = pageTitle(route.title)
  check(
    `${label}: <title> is ${expectedTitle}`,
    tag(html, /<title>([^<]*)<\/title>/) === expectedTitle,
  )
  check(
    `${label}: og:title matches <title>`,
    tag(html, /property="og:title"\s+content="([^"]*)"/) === expectedTitle,
  )
  check(
    `${label}: twitter:title matches <title>`,
    tag(html, /name="twitter:title"\s+content="([^"]*)"/) === expectedTitle,
  )
  check(
    `${label}: description matches the route`,
    tag(html, /name="description"\s+content="([^"]*)"/) === route.description,
  )
  check(
    `${label}: canonical is self-referential`,
    html.includes(`<link rel="canonical" href="${SITE_URL}${route.path}"`),
  )
  check(
    `${label}: og:url matches canonical`,
    html.includes(`property="og:url" content="${SITE_URL}${route.path}"`),
  )
  check(`${label}: has JSON-LD`, html.includes('application/ld+json'))
  check(`${label}: has no Font Awesome CDN reference`, !html.includes('cdnjs.cloudflare.com'))
  check(`${label}: has no Google Fonts reference`, !html.includes('fonts.googleapis.com'))
}

const fallback = join(dist, '404.html')
check('404.html emitted for deep links', existsSync(fallback))
if (existsSync(fallback)) {
  check(
    '404.html is a shell, not the prerendered homepage',
    readFileSync(fallback, 'utf8').includes('<div id="root"></div>'),
  )
}

const sitemapPath = join(dist, 'sitemap.xml')
check('sitemap.xml emitted', existsSync(sitemapPath))
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8')
  for (const route of ROUTES) {
    check(`sitemap lists ${route.path}`, sitemap.includes(`<loc>${SITE_URL}${route.path}</loc>`))
  }
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  check('sitemap has no entries beyond the known routes', listed.length === ROUTES.length)
}

// One favicon, taken from the logo.
const home = readFileSync(join(dist, 'index.html'), 'utf8')
check(
  'favicon declared in <head>',
  home.includes('rel="icon" type="image/svg+xml" href="/logo.svg"'),
)
check('logo.svg present in dist', existsSync(join(dist, 'logo.svg')))
check('no stale icon references', !/mark\.svg|favicon-\d|apple-touch|mask-icon/.test(home))

// The logo must stay cropped to its ink, or it renders at half height — the
// padded-canvas defect that made the old nav logo unreadable.
const logo = readFileSync(join(root, 'public/logo.svg'), 'utf8')
const viewBox = logo
  .match(/viewBox="([-\d.\s]+)"/)?.[1]
  .trim()
  .split(/\s+/)
  .map(Number)
check('logo has a viewBox', Boolean(viewBox))
if (viewBox?.length === 4) {
  const [, , w, h] = viewBox
  const aspect = w / h
  check(
    `logo viewBox is cropped to ink (aspect ${aspect.toFixed(3)}, expected ~3.8)`,
    aspect > 3.5 && aspect < 4.1,
  )
  check('logo canvas is not the original 800x360 export box', !(w === 800 && h === 360))
}

if (failures.length) {
  console.error('[verify-build] FAILED')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(`[verify-build] ok — ${ROUTES.length} routes, 404 fallback, sitemap consistent`)
