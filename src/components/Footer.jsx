import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { DISCORD_URL, GITHUB_URL, NAMESERVERS, ORG, API_PATH, PANEL_URL } from '../data/site.js'
import { FREE_RECORDS_PER_DOMAIN, PLANS, formatRecords } from '../data/plans.js'

const FREE_PLAN = PLANS.find((p) => p.id === 'free')

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col footer__col--brand">
          <div className="footer__brand">
            <img src="/logo.svg" alt="Intent" className="footer__mark" width="65" height="17" />
            <span className="nav__brand-accent">-DNS</span>
          </div>
          <p className="footer__tagline">
            Authoritative DNS on anycast nameservers, free for {FREE_PLAN.domains} domains with{' '}
            {formatRecords(FREE_RECORDS_PER_DOMAIN).toLowerCase()}. Part of the Intent project.
          </p>
          <div className="footer__social">
            <a href={DISCORD_URL} aria-label="Discord" target="_blank" rel="noreferrer">
              <Icon name="discord" size={16} />
            </a>
            <a href={GITHUB_URL} aria-label="GitHub" target="_blank" rel="noreferrer">
              <Icon name="github" size={16} />
            </a>
            <a href={`mailto:${ORG.email}`} aria-label={`Email ${ORG.email}`}>
              <Icon name="envelope" size={15} />
            </a>
          </div>
        </div>

        <nav className="footer__col" aria-label="Product">
          <h2>Product</h2>
          <Link to="/pricing">Pricing</Link>
          <Link to="/dns-records">DNS Records</Link>
          <a href={`${PANEL_URL}/?page=signup`}>Dashboard</a>
          <a href={`${PANEL_URL}/api-docs.php`}>API reference</a>
        </nav>

        <div className="footer__col">
          <h2>Infrastructure</h2>
          {NAMESERVERS.map((ns) => (
            <span key={ns} className="footer__static">
              {ns}
            </span>
          ))}
          <span className="footer__static">REST {API_PATH}</span>
        </div>

        <div className="footer__col">
          <h2>Community</h2>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">
            Discord
          </a>
          <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
          <a href={ORG.url} target="_blank" rel="noreferrer">
            int.yt — free subdomains
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>Intent-DNS © {year}</span>
        <span className="footer__note">ALIAS-capable authoritative DNS, free to start</span>
      </div>
    </footer>
  )
}
