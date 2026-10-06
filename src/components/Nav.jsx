import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import { API_DOCS_URL, LOGIN_URL, SIGNUP_URL } from '../data/site.js'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/dns-records', label: 'DNS Records' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const headerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on navigation — otherwise the mobile sheet stays open after a
  // client-side route change.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return

    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e) => {
      if (!headerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header ref={headerRef} className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <img src="/logo.svg" alt="Intent" className="nav__mark" width="76" height="20" />
          <span className="nav__brand-accent">-DNS</span>
        </Link>

        <nav aria-label="Primary" className="nav__links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href={API_DOCS_URL}
            className="nav__link nav__link--external"
            target="_blank"
            rel="noreferrer"
          >
            API
            <Icon name="arrow-up-right-from-square" size={11} />
          </a>
        </nav>

        <div className="nav__cta">
          <a href={LOGIN_URL} className="btn btn--ghost btn--sm">
            Log in
          </a>
          <a href={SIGNUP_URL} className="btn btn--primary btn--sm">
            Get started
          </a>
        </div>

        <button
          type="button"
          className="nav__burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-mobile"
        >
          <Icon name={open ? 'xmark' : 'bars'} size={16} />
        </button>
      </div>

      {open && (
        <div className="nav__mobile" id="nav-mobile">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className="nav__mobile-link">
              {l.label}
            </NavLink>
          ))}
          <a href={API_DOCS_URL} className="nav__mobile-link" target="_blank" rel="noreferrer">
            API docs
          </a>
          <div className="nav__mobile-cta">
            <a href={LOGIN_URL} className="btn btn--ghost">
              Log in
            </a>
            <a href={SIGNUP_URL} className="btn btn--primary">
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
