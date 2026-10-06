// Plan definitions. The pricing page, the comparison table, the JSON-LD offer
// catalogue and the sitemap all read from here — change a price once.
//
// `null` on a limit means "unlimited".

import { SIGNUP_URL } from './site.js'

export const FREE_RECORDS_PER_DOMAIN = 1000

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    tagline: 'For personal projects and side builds',
    domains: 20,
    recordsPerDomain: FREE_RECORDS_PER_DOMAIN,
    features: [
      'Authoritative DNS on anycast nameservers',
      'Full REST API access',
      'All record types, including apex ALIAS',
      'Dashboard and API record management',
    ],
    cta: 'Start for free',
    href: SIGNUP_URL,
    highlight: true,
  },
  {
    id: 'paid',
    name: 'Paid',
    price: 1,
    period: 'per month',
    tagline: 'For freelancers juggling client domains',
    domains: 100,
    recordsPerDomain: FREE_RECORDS_PER_DOMAIN,
    features: [
      'Everything in Free',
      '100 domain slots instead of 20',
      'Same record ceiling per domain',
      'Same anycast infrastructure',
    ],
    cta: 'Get in touch',
    href: '#buy',
    highlight: false,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 4,
    period: 'per month',
    tagline: 'For agencies and platforms at volume',
    domains: null,
    recordsPerDomain: null,
    features: [
      'Everything in Paid',
      'No domain-slot ceiling',
      'No record ceiling',
      'Built for reseller workloads',
    ],
    cta: 'Get in touch',
    href: '#buy',
    highlight: false,
  },
]

export const formatPrice = (price) => (price === 0 ? '$0' : `$${price}`)

export const formatDomains = (n) => (n === null ? 'Unlimited' : `${n.toLocaleString()}`)

// One phrasing of the record limit for the whole site. It appears in the h1,
// the <title>, the meta description, the pricing table and the JSON-LD, so a
// second wording is a second thing that can drift.
export const formatRecords = (n) =>
  n === null ? 'Unlimited records' : `${n.toLocaleString()} records per domain`

// Comparison matrix for the pricing table. Boolean features are identical on
// every tier by design — the table exists to prove that, not to hide it.
export const MATRIX_ROWS = [
  {
    label: 'Domain slots',
    values: PLANS.map((p) => formatDomains(p.domains)),
  },
  {
    label: 'DNS records per domain',
    values: PLANS.map((p) => formatRecords(p.recordsPerDomain)),
  },
  {
    label: 'REST API access',
    values: PLANS.map(() => true),
  },
  {
    label: 'ALIAS record support',
    values: PLANS.map(() => true),
  },
  {
    label: 'Anycast nameservers',
    values: PLANS.map(() => true),
  },
  {
    label: 'Price',
    values: PLANS.map((p) => (p.price === 0 ? '$0' : `${formatPrice(p.price)} / mo`)),
  },
]
