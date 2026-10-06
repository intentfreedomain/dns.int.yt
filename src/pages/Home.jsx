import { Link } from 'react-router-dom'
import DnsTerminal from '../components/DnsTerminal.jsx'
import Seo from '../components/Seo.jsx'
import Icon from '../components/Icon.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { DISCORD_URL, SIGNUP_URL, NAMESERVERS } from '../data/site.js'
import { RECORDS, recordCount } from '../data/records.js'
import { FREE_RECORDS_PER_DOMAIN, formatRecords } from '../data/plans.js'

const FEATURES = [
  {
    icon: 'link',
    title: 'ALIAS at the apex',
    body: 'A CNAME cannot sit at a zone apex, because the apex also carries SOA and NS. ALIAS can — point your root domain at any hostname and it resolves like an A record.',
  },
  {
    icon: 'code',
    title: 'Full REST API',
    body: 'Every dashboard action has an API equivalent. Create zones, edit records, read your limits — all on every plan, free included.',
  },
  {
    icon: 'layer-group',
    title: `${formatRecords(FREE_RECORDS_PER_DOMAIN)}`,
    body: 'The same ceiling on the free plan as on the paid ones. Paid tiers raise the domain count, not the record count.',
  },
  {
    icon: 'globe',
    title: 'Anycast nameservers',
    body: `${NAMESERVERS[0]} and ${NAMESERVERS[1]} resolve to one anycast address, so a query is answered from whichever network reaches it first.`,
  },
  {
    icon: 'shield-halved',
    title: 'Nine record types',
    body: 'A, AAAA, ALIAS, CNAME, MX, TXT, SRV, NS and CAA. Validation rejects the combinations DNS forbids, like ALIAS alongside an A record.',
  },
  {
    icon: 'envelope',
    title: 'Import an existing zone',
    body: 'Point us at a domain and DNS discovery finds the records already published there, so you can review and import them instead of retyping.',
  },
]

export default function Home() {
  const [featuresRef, featuresRevealed] = useReveal()
  const [recordsRef, recordsRevealed] = useReveal()
  const [intytRef, intytRevealed] = useReveal()

  return (
    <>
      <Seo path="/" />

      {/* Hero — the offer in the headline, the reason to care right under it. */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <div className="pill pill--gold">
              <Icon name="link" size={12} /> Apex ALIAS, on the free plan
            </div>
            <h1>
              Free authoritative DNS with{' '}
              <span className="hero__gold">{formatRecords(FREE_RECORDS_PER_DOMAIN)}</span>
            </h1>
            <p className="hero__sub">
              Intent-DNS is anycast DNS for developers — apex ALIAS so your root domain can point at
              a hostname, a full REST API, and 1,000 records per domain, more than most real zones
              use. Free forever, no card required.
            </p>
            <div className="hero__cta">
              <a href={SIGNUP_URL} className="btn btn--primary btn--lg">
                <Icon name="bolt" size={14} /> Create a free account
              </a>
              <Link to="/dns-records" className="btn btn--ghost btn--lg">
                <Icon name="book" size={14} /> See every record type
              </Link>
            </div>
            <div className="hero__trust">
              <span>
                <Icon name="check" size={11} /> No credit card
              </span>
              <span>
                <Icon name="check" size={11} /> API on every plan
              </span>
              <span>
                <Icon name="check" size={11} /> {recordCount} record types
              </span>
            </div>
          </div>

          <div className="hero__visual">
            <DnsTerminal />
          </div>
        </div>
      </section>

      {/* The constraint that makes ALIAS necessary, stated once and concretely. */}
      <section className="section--tight">
        <div className="container">
          <div className="apex-compare card">
            <div className="apex-compare__col apex-compare__col--blocked">
              <div className="apex-compare__head">
                <Icon name="xmark" size={13} /> What you cannot publish
              </div>
              <pre className="apex-compare__zone">
                {`@   CNAME   project.onrender.com.
                 ^ rejected`}
              </pre>
              <p>
                The apex of <code>example.com</code> is already the name in the zone’s SOA and NS
                records. A CNAME there would make the zone self-referential, so the RFC forbids it
                outright.
              </p>
            </div>
            <div className="apex-compare__col apex-compare__col--ok">
              <div className="apex-compare__head">
                <Icon name="check" size={13} /> What you publish instead
              </div>
              <pre className="apex-compare__zone">
                {`@   ALIAS   project.onrender.com.
@   NS       dns1.int.yt.
@   SOA     ns1.int.yt. hostmaster.int.yt. 1`}
              </pre>
              <p>
                ALIAS flattens the target into an address answer, so the apex resolves like an A
                record while SOA and NS stay exactly where they belong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        ref={featuresRef}
        className={`section reveal-group ${featuresRevealed ? 'is-revealed' : ''}`}
      >
        <div className="container">
          <div className="section-head">
            <h2>What you get on every plan</h2>
            <p>
              Free and paid run the same engine, expose the same API and accept the same record
              types. Only the number of domains changes.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-card__icon">
                  <Icon name={f.icon} size={17} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Record types */}
      <section
        ref={recordsRef}
        className={`section reveal-group ${recordsRevealed ? 'is-revealed' : ''}`}
      >
        <div className="container">
          <div className="section-head">
            <h2>Every record type, none held back</h2>
            <p>
              Nine types, all on the free plan.{' '}
              <Link to="/dns-records" className="link">
                See what each one looks like in a real zone
              </Link>
              .
            </p>
          </div>

          <div className="record-grid">
            {RECORDS.map((r) => (
              <div key={r.type} className="record-chip">
                <span className={`record-chip__type ${r.highlight ? 'is-highlight' : ''}`}>
                  {r.type}
                </span>
                <span className="record-chip__desc">{r.summary}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* int.yt integration */}
      <section
        ref={intytRef}
        className={`section reveal-group ${intytRevealed ? 'is-revealed' : ''}`}
      >
        <div className="container">
          <div className="intyt-banner card">
            <div className="intyt-banner__copy">
              <div className="pill pill--blue">
                <Icon name="globe" size={12} /> Works with int.yt
              </div>
              <h2>Already have an int.yt subdomain?</h2>
              <p>
                The subdomain and the DNS account are separate — you claim the name in the int.yt
                panel, then manage its records here. Delegating takes one step: point the
                subdomain’s nameservers at <code>{NAMESERVERS[0]}</code> and{' '}
                <code>{NAMESERVERS[1]}</code>.
              </p>
              <div className="intyt-banner__cta">
                <a
                  href="https://int.yt"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--ghost"
                >
                  Get a free int.yt subdomain
                </a>
                <a href={SIGNUP_URL} className="btn btn--primary">
                  Create your DNS account
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — the last of four, not the seventh. */}
      <section className="section final-cta">
        <div className="container">
          <div className="final-cta__inner">
            <h2>Delegate two nameservers and you are authoritative</h2>
            <p>
              {formatRecords(FREE_RECORDS_PER_DOMAIN).toLowerCase()} on every plan, API included. No
              trial, no card, no downgrade trap.
            </p>
            <div className="final-cta__buttons">
              <a href={SIGNUP_URL} className="btn btn--primary btn--lg">
                <Icon name="rocket" size={14} /> Create your free account
              </a>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost btn--lg"
              >
                <Icon name="discord" size={14} /> Ask a question on Discord
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
