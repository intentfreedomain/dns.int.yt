import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Home from '../src/pages/Home.jsx'
import Pricing from '../src/pages/Pricing.jsx'
import DnsRecords from '../src/pages/DnsRecords.jsx'
import NotFound from '../src/pages/NotFound.jsx'
import Footer from '../src/components/Footer.jsx'
import Nav from '../src/components/Nav.jsx'
import { DISCORD_URL, SIGNUP_URL, NAMESERVERS, HOME } from '../src/data/site.js'
import { PLANS } from '../src/data/plans.js'

const renderAt = (ui, path = '/') =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)

describe('Home', () => {
  it('leads with the category and a quantified offer, not a bare feature', () => {
    renderAt(<Home />)
    const h1 = screen.getByRole('heading', { level: 1 })
    // Names the category and what it costs, for search and cold visitors...
    expect(h1).toHaveTextContent(/free authoritative DNS/i)
    // ...with the concrete number in the headline rather than buried.
    expect(h1).toHaveTextContent(/1,000 records per domain/i)
    // The exact wording is owned by site.js and shared with <title>.
    expect(h1).toHaveTextContent(HOME.title)
  })

  it('does not hang the headline on a competitor limit we do not control', () => {
    renderAt(<Home />)
    const h1 = screen.getByRole('heading', { level: 1 })
    // Cloudflare's per-zone cap moved 1,000 -> 200 for new zones in Sept 2024.
    // It belongs in the dated comparison table, not in the h1.
    expect(h1).not.toHaveTextContent(/\b200\b/)
    expect(h1).not.toHaveTextContent(/others|competitors|compared/i)
  })

  it('still leads with ALIAS in the pill and the subhead', () => {
    renderAt(<Home />)
    expect(screen.getByText(/apex alias, on the free plan/i)).toBeInTheDocument()
    expect(document.querySelector('.hero__sub').textContent).toMatch(/apex ALIAS/)
  })

  it('reinforces the headline with benefits in one tight paragraph', () => {
    renderAt(<Home />)
    const sub = document.querySelector('.hero__sub')

    // Same shape as the copy that worked: subject, audience, benefit clauses,
    // offer. An earlier attempt turned this into a two-paragraph explanation of
    // what a DNS record is — twice the length, less coverage, read like docs.
    expect(sub.textContent).toMatch(/^Intent-DNS is anycast DNS for developers/)
    expect(sub.textContent).toMatch(/apex ALIAS so your root domain can point at a hostname/)
    expect(sub.textContent).toMatch(/full REST API/)
    expect(sub.textContent).toMatch(/1,000 records per domain/)
    expect(sub.textContent).toMatch(/Free forever, no card required/)

    expect(sub.tagName).toBe('P')
    // Guard against the subhead bloating again.
    expect(sub.textContent.trim().split(/\s+/).length).toBeLessThan(45)

    // And it justifies the number rather than leaving it asserted.
    expect(sub.textContent).toMatch(/more than most real zones use/)
  })

  it('does not repeat the record limit in the trust row now that the sub explains it', () => {
    renderAt(<Home />)
    const trust = document.querySelector('.hero__trust').textContent
    expect(trust).toMatch(/record types/i)
    expect(trust).not.toMatch(/1,000/)
  })

  it('explains why a CNAME cannot sit at the apex', () => {
    renderAt(<Home />)
    expect(screen.getByText(/rejected/i)).toBeInTheDocument()
    // The apex rule is stated in both the hero and the side-by-side panel.
    expect(screen.getAllByText(/SOA and NS/i).length).toBeGreaterThanOrEqual(2)
  })

  it('has exactly one h1', () => {
    renderAt(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('links to signup with the shared constant', () => {
    renderAt(<Home />)
    const ctas = screen.getAllByRole('link', { name: /create your free account/i })
    expect(ctas.length).toBeGreaterThan(0)
    for (const cta of ctas) expect(cta).toHaveAttribute('href', SIGNUP_URL)
  })

  it('has no dead Discord invite anywhere on the page', () => {
    const { container } = renderAt(<Home />)
    const hrefs = [...container.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
    expect(hrefs.filter((h) => h?.includes('discord.gg'))).toEqual([DISCORD_URL])
  })
})

describe('Pricing', () => {
  it('renders every plan from the data with its real price', () => {
    renderAt(<Pricing />, '/pricing')
    for (const plan of PLANS) {
      const card = screen.getByRole('heading', { name: plan.name }).closest('.plan-card')
      expect(card).not.toBeNull()
      expect(within(card).getByText(plan.price === 0 ? '$0' : `$${plan.price}`)).toBeInTheDocument()
      expect(within(card).getByText(plan.tagline)).toBeInTheDocument()
      expect(within(card).getByRole('link', { name: plan.cta })).toBeInTheDocument()
    }
  })

  it('recommends the free tier rather than a paid one', () => {
    renderAt(<Pricing />, '/pricing')
    expect(screen.getByText('Start here')).toBeInTheDocument()
  })

  it('shows the identical-rows comparison', () => {
    renderAt(<Pricing />, '/pricing')
    const checks = screen.getAllByText('Included')
    // three boolean rows x three plans
    expect(checks).toHaveLength(9)
  })

  it('keeps the Cloudflare comparison sourced and dated', () => {
    renderAt(<Pricing />, '/pricing')
    expect(screen.getByText(/Cloudflare Free allows 200 records per zone/i)).toBeInTheDocument()
  })
})

describe('DnsRecords explorer', () => {
  it('opens on ALIAS and switches on selection', async () => {
    const user = userEvent.setup()
    renderAt(<DnsRecords />, '/dns-records')

    const aliasTab = screen.getByRole('tab', { name: /ALIAS/ })
    expect(aliasTab).toHaveAttribute('aria-selected', 'true')

    const mxTab = screen.getByRole('tab', { name: /Route inbound email/ })
    await user.click(mxTab)

    expect(mxTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('10 mail.provider.com.')
  })

  it('is arrow-key navigable', async () => {
    const user = userEvent.setup()
    renderAt(<DnsRecords />, '/dns-records')

    const aliasTab = screen.getByRole('tab', { name: /ALIAS/ })
    aliasTab.focus()
    await user.keyboard('{ArrowDown}')

    expect(
      screen.getByRole('tab', { name: /Canonical hostname|Alias one hostname/ }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('links the tabpanel back to its tab for assistive tech', () => {
    renderAt(<DnsRecords />, '/dns-records')
    const panel = screen.getByRole('tabpanel')
    const labelledBy = panel.getAttribute('aria-labelledby')
    expect(labelledBy).toMatch(/^tab-/)
    expect(document.getElementById(labelledBy)).toBeInTheDocument()
  })
})

describe('NotFound', () => {
  it('names the missing path and offers the real routes', () => {
    renderAt(<NotFound />, '/nope')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('/nope')
    expect(screen.getByRole('link', { name: /Pricing/ })).toHaveAttribute('href', '/pricing')
  })
})

describe('chrome', () => {
  it('nav marks the current route and exposes the mobile toggle state', () => {
    renderAt(<Nav />, '/pricing')
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveClass('is-active')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('mobile menu closes on Escape', async () => {
    const user = userEvent.setup()
    renderAt(<Nav />, '/')

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: /close menu/i })).not.toBeInTheDocument()
  })

  it('footer lists both nameservers and no fake status indicator', () => {
    renderAt(<Footer />)
    for (const ns of NAMESERVERS) {
      expect(screen.getByText(ns)).toBeInTheDocument()
    }
    expect(screen.queryByText(/all systems operational/i)).not.toBeInTheDocument()
  })

  it('footer does not advertise a version number that can go stale', () => {
    const { container } = renderAt(<Footer />)
    expect(container.textContent).not.toMatch(/v\d+\.\d+\.\d+/)
  })
})
