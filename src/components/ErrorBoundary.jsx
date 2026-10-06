import { Component } from 'react'

/**
 * A render error in one route should not leave the visitor with a blank page
 * and no way back. Shows the message and a link home instead.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="container">
        <div className="error-panel card">
          <h1>Something broke on this page</h1>
          <p>
            The error has been logged. Reload the page, or head back to the homepage and try a
            different route.
          </p>
          <div className="error-panel__cta">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <a href="/" className="btn btn--primary">
              Go to homepage
            </a>
          </div>
        </div>
      </div>
    )
  }
}
