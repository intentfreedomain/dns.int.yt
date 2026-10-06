import Seo from '../components/Seo.jsx'
import Icon from '../components/Icon.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { DISCORD_URL, ORG } from '../data/site.js'
import { PLANS, MATRIX_ROWS, formatPrice, formatDomains, formatRecords } from '../data/plans.js'
import { recordCount } from '../data/records.js'

export default function Pricing() {
  const [gridRef, gridRevealed] = useReveal()
  const [buyRef, buyRevealed] = useReveal()
  const [matrixRef, matrixRevealed] = useReveal()

  return (
    <>
      <Seo path="/pricing" />

      <section className="page-hero">
        <div className="container">
          <h1>Pricing that doesn’t punish growth</h1>
          <p className="page-hero__sub">
            Every plan gets the same anycast infrastructure, the same REST API and the same{' '}
            {recordCount} record types. Only the number of zones changes — there is no record
            ceiling worth upselling past.
          </p>
        </div>
      </section>

      <section
        ref={gridRef}
        className={`section--tight reveal-group ${gridRevealed ? 'is-revealed' : ''}`}
      >
        <div className="container">
          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card card ${plan.highlight ? 'is-highlight' : ''}`}
              >
                {plan.highlight && <div className="plan-card__badge">Start here</div>}
                <h2>{plan.name}</h2>
                <p className="plan-card__tagline">{plan.tagline}</p>
                <div className="plan-card__price">
                  <span className="plan-card__price-num">{formatPrice(plan.price)}</span>
                  <span className="plan-card__price-period">{plan.period}</span>
                </div>

                <div className="plan-card__limits">
                  <div>
                    <Icon name="globe" size={14} /> {formatDomains(plan.domains)} domain slots
                  </div>
                  <div>
                    <Icon name="layer-group" size={14} /> {formatRecords(plan.recordsPerDomain)}
                  </div>
                </div>

                <ul className="plan-card__features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={12} /> {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`btn btn--block ${plan.highlight ? 'btn--primary' : 'btn--ghost'}`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={buyRef}
        className={`section reveal-group ${buyRevealed ? 'is-revealed' : ''}`}
        id="buy"
      >
        <div className="container">
          <div className="buy-panel card">
            <div className="buy-panel__icon">
              <Icon name="bag-shopping" size={20} />
            </div>
            <h2>Contact us for Paid tiers</h2>
            <p>
              Paid tiers are switched on by hand. Message us with the plan you want and an admin
              will move your account up.
            </p>
            <div className="buy-panel__cta">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn btn--primary">
                <Icon name="discord" size={14} /> Contact us on Discord
              </a>
              <a href={`mailto:${ORG.email}`} className="btn btn--ghost">
                <Icon name="envelope" size={14} /> {ORG.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={matrixRef}
        className={`section--tight reveal-group ${matrixRevealed ? 'is-revealed' : ''}`}
      >
        <div className="container">
          <div className="section-head">
            <h2>Side by side</h2>
          </div>

          <div className="table-wrap card">
            <table className="compare-table">
              <caption className="visually-hidden">
                Feature comparison across the Free, Paid and Unlimited plans
              </caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, i) => (
                      <td key={PLANS[i].id}>
                        {value === true ? (
                          <>
                            <Icon name="check" size={13} className="table-check" />
                            <span className="visually-hidden">Included</span>
                          </>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="pricing-note">
            Record ceiling compared to other free plans: Cloudflare Free allows 200 records per
            zone, Intent-DNS allows 1,000. Verified against Cloudflare’s DNS quota documentation,
            October 2026.
          </p>
        </div>
      </section>
    </>
  )
}
