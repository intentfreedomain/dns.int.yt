// Single source of truth for anything that appears in more than one place:
// brand strings, URLs, infrastructure identifiers.
//
// Rule: if a string is user-visible AND duplicated, it lives here. The sitemap,
// JSON-LD, meta tags, nav, footer and README all derive from these values.

export const BRAND = 'Intent-DNS'

export const SITE_URL = 'https://dns.int.yt'

export const ORG = {
  name: 'Intent',
  url: 'https://int.yt',
  email: 'admin@int.yt',
}

export const PANEL_URL = 'https://panel.dns.int.yt'
export const SIGNUP_URL = `${PANEL_URL}/?page=signup`
export const LOGIN_URL = `${PANEL_URL}/?page=login`
export const API_DOCS_URL = `${PANEL_URL}/api-docs.php`

export const API_PATH = '/api/v1'

export const API_BASE = `${SITE_URL}${API_PATH}`

export const DISCORD_URL = 'https://discord.gg/NCS96PS4MH'
export const GITHUB_URL = 'https://github.com/intentfreedomain/FreeDomain'

// The two nameservers customers are told to delegate to.
//
// Verified 2026-10-03: dns1.int.yt and dns2.int.yt resolve to the *same*
// address (192.255.149.52) from independent resolvers (1.1.1.1, 8.8.8.8).
// One address serving two hostnames from multiple networks is the anycast
// signature — a unicast design would use two distinct addresses.
// Verify it yourself: dig +short dns1.int.yt @1.1.1.1
export const NAMESERVERS = ['dns1.int.yt', 'dns2.int.yt']
export const NAMESERVER_ANYCAST_IP = '192.255.149.52'

// Referenced by index.html at build time and by the docs. Kept free of version
// numbers on purpose: the marketing site has no business displaying an
// operational version that silently goes stale.
export const AUTHORITATIVE_ENGINE = 'PowerDNS Authoritative'
export const RESOLVER_ENGINE = 'PowerDNS Recursor'

/**
 * The homepage's own metadata. `HOME.title` is what the h1 renders verbatim and
 * what pageTitle() hands to <title>, og:title and twitter:title — one string,
 * so the headline and the tab cannot say different things.
 */
export const HOME = {
  title: 'Free authoritative DNS with 1,000 records per domain',
  description:
    'Free authoritative DNS with 1,000 records per domain, plus apex ALIAS so your root domain can point at a hostname. Full REST API on every plan, 20 free domains, no credit card required.',
  path: '/',
}

/** One title builder, shared by the client runtime and the build step. */
export const pageTitle = (title) => (title ? `${title} · ${BRAND}` : `${HOME.title} · ${BRAND}`)

export const ROUTES = [
  { path: '/', title: null, description: HOME.description },
  {
    path: '/pricing',
    title: 'Pricing',
    description:
      'Free: 20 domains with 1,000 records each. Paid $1/mo: 100 domains. Unlimited $4/mo: unlimited domains and records. Same engine and API on every tier.',
  },
  {
    path: '/dns-records',
    title: 'DNS Records',
    description:
      'All nine supported DNS record types with real zone-file examples, including ALIAS apex flattening. 1,000 records per domain, free on every plan.',
  },
]
