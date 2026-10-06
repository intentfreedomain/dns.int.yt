import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Fonts are bundled, not fetched from Google: no third-party request, no
// privacy leak to a CDN, and no render-blocking stylesheet from another origin.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'

import './styles/tokens.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'

import App from './App.jsx'

const container = document.getElementById('root')

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Prerendered pages ship real markup, so hydrate. The 404 fallback and local
// dev both hand us an empty root, so fall back to a client render.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}
