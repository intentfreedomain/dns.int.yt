import { useState } from 'react'
import Seo from '../components/Seo.jsx'
import Icon from '../components/Icon.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { NAMESERVERS, SIGNUP_URL } from '../data/site.js'
import { RECORDS, ALIAS_CONFLICTS, ALIAS_COEXIST, recordCount } from '../data/records.js'
import { formatRecords, FREE_RECORDS_PER_DOMAIN } from '../data/plans.js'

export default function DnsRecords() {
  const [active, setActive] = useState(RECORDS.find((r) => r.highlight))
  const [nsRef, nsRevealed] = useReveal()

  return (
    <>
      <Seo path="/dns-records" />

      <section className="page-hero">
        <div className="container">
          <div className="pill pill--gold">
            <Icon name="layer-group" size={12} /> {recordCount} record types
          </div>
          <h1>What each record actually looks like</h1>
          <p className="page-hero__sub">
            Pick a type to see a real zone-file line and what it does. All of them are available on
            the free plan.
          </p>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <div
            className="records-explorer"
            role="tablist"
            aria-label="DNS record types"
            aria-orientation="vertical"
          >
            <div className="records-explorer__list" role="presentation">
              {RECORDS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  role="tab"
                  id={`tab-${r.type}`}
                  aria-selected={active.type === r.type}
                  aria-controls={`panel-${r.type}`}
                  tabIndex={active.type === r.type ? 0 : -1}
                  className={`records-explorer__item ${active.type === r.type ? 'is-active' : ''}`}
                  onClick={() => setActive(r)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
                    e.preventDefault()
                    const i = RECORDS.indexOf(active)
                    const next =
                      RECORDS[
                        (i + (e.key === 'ArrowDown' ? 1 : -1) + RECORDS.length) % RECORDS.length
                      ]
                    setActive(next)
                    document.getElementById(`tab-${next.type}`)?.focus()
                  }}
                >
                  <span className={`record-chip__type ${r.highlight ? 'is-highlight' : ''}`}>
                    {r.type}
                  </span>
                  <span>{r.summary}</span>
                </button>
              ))}
            </div>

            <div
              key={active.type}
              role="tabpanel"
              id={`panel-${active.type}`}
              aria-labelledby={`tab-${active.type}`}
              className="records-explorer__preview card"
              tabIndex={0}
            >
              <div className="records-explorer__preview-head">
                <span className={`record-chip__type ${active.highlight ? 'is-highlight' : ''}`}>
                  {active.type}
                </span>
                <span className="zone-ttl">TTL {active.ttl}</span>
              </div>

              <pre className="zone-file">
                <span className="zone-file__name">{active.name}</span>
                <span className="zone-file__type">{active.type}</span>
                <span className="zone-file__content">{active.content}</span>
              </pre>

              <p className="records-explorer__desc">{active.detail}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ALIAS coexistence rules — the part that surprises people. */}
      <section className="section--tight">
        <div className="container">
          <div className="alias-rules">
            <div className="alias-rules__col">
              <h2>
                <Icon name="xmark" size={14} /> Rejected next to ALIAS
              </h2>
              <ul>
                {ALIAS_CONFLICTS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p>
                Two address records at one name is ambiguous, and a CNAME there would make the zone
                self-referential. Both are refused at validation.
              </p>
            </div>
            <div className="alias-rules__col">
              <h2>
                <Icon name="check" size={14} /> Allowed next to ALIAS
              </h2>
              <ul>
                {ALIAS_COEXIST.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p>
                These describe something other than the address at that name, so an ALIAS alongside
                them is unambiguous and is accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={nsRef} className={`section reveal-group ${nsRevealed ? 'is-revealed' : ''}`}>
        <div className="container">
          <div className="section-head">
            <h2>Delegate to these two</h2>
            <p>
              Both names resolve to the same anycast address, so a query is answered by whichever
              network reaches it first rather than by one far-away origin. You can confirm that
              yourself:
            </p>
          </div>

          <pre className="ns-verify">
            {`dig +short ${NAMESERVERS[0]} @1.1.1.1
dig +short ${NAMESERVERS[1]} @1.1.1.1`}
          </pre>

          <div className="ns-grid">
            {NAMESERVERS.map((ns, i) => (
              <div key={ns} className="ns-card card">
                <h3>{ns}</h3>
                <p>{i === 0 ? 'First name in the delegation' : 'Second name in the delegation'}</p>
                <span className="pill pill--blue">
                  <span className="pill-dot" /> anycast
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="container">
          <div className="final-cta__inner">
            <h2>Publish these records on your own zone</h2>
            <p>
              {formatRecords(FREE_RECORDS_PER_DOMAIN).toLowerCase()}, free. Point your nameservers
              at {NAMESERVERS[0]} and {NAMESERVERS[1]} and you are authoritative.
            </p>
            <div className="final-cta__buttons">
              <a href={SIGNUP_URL} className="btn btn--primary btn--lg">
                <Icon name="bolt" size={14} /> Start for free
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
