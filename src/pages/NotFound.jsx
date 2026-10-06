import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Icon from '../components/Icon.jsx'
import { ROUTES } from '../data/site.js'

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <>
      <Seo
        title="Page not found"
        description="That URL does not exist on this site."
        path={pathname}
      />

      <section className="not-found">
        <div className="container">
          <div className="error-panel card">
            <p className="not-found__code">404</p>
            <h1>No route to {pathname}</h1>
            <p>That URL is not part of this site. The pages that exist are below.</p>
            <ul className="not-found__links">
              {ROUTES.map((r) => (
                <li key={r.path}>
                  <Link to={r.path}>
                    {r.title ?? 'Homepage'}
                    <Icon name="arrow-up-right-from-square" size={11} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
