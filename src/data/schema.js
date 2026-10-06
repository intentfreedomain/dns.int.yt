// Structured data, generated from the same constants the pages render.
// Consumed by scripts/prerender.mjs, which injects it into each static HTML
// file. Keeping it here means a price change updates the JSON-LD too.

import { BRAND, SITE_URL, ORG, NAMESERVERS } from './site.js'
import { PLANS } from './plans.js'

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG.name,
    url: ORG.url,
    email: ORG.email,
    slogan: 'Free subdomains and DNS for developers',
  }
}

export function webSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en',
  }
}

export function serviceSchema() {
  return {
    '@type': 'Service',
    '@id': `${SITE_URL}/#service`,
    name: `${BRAND} authoritative DNS hosting`,
    serviceType: 'Authoritative DNS hosting',
    description:
      'Authoritative DNS hosting with apex ALIAS flattening and a REST API on every plan.',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'Worldwide',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${SITE_URL}/`,
      availableLanguage: 'en',
    },
  }
}

export function offerCatalogSchema() {
  return {
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/#offers`,
    name: `${BRAND} plans`,
    itemListElement: PLANS.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      description: `${formatLimit(plan.domains)} domains, ${formatLimit(plan.recordsPerDomain)} records per domain`,
      price: String(plan.price),
      priceCurrency: 'USD',
      url: `${SITE_URL}/pricing`,
      availability: 'https://schema.org/InStock',
    })),
  }
}

function formatLimit(n) {
  return n === null ? 'unlimited' : n.toLocaleString('en-US')
}

export function faqSchema() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which nameservers do I delegate my domain to?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Delegate your domain to ${NAMESERVERS.join(' and ')}. Both names resolve to the same anycast address, so queries are answered from whichever network reaches it first.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I point my root domain at a hostname instead of an IP address?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Publish an ALIAS record at the apex. A CNAME is not allowed there because the apex must also carry SOA and NS records; ALIAS is.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the REST API available on the free plan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every tier gets the same API, the same record types and the same anycast infrastructure. Paid tiers only raise the domain-slot ceiling.',
        },
      },
    ],
  }
}

export function graph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(),
      webSiteSchema(),
      serviceSchema(),
      offerCatalogSchema(),
      faqSchema(),
    ],
  }
}
