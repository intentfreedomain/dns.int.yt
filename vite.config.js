import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Opt-in host allowlist for dev only. dev-tunnel.sh sets this when it exposes
// the dev server through a Cloudflare Quick Tunnel, whose subdomain is random
// on every run. Defaults to empty — nothing extra is trusted unless asked.
const allowedHosts = (process.env.DEV_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

export default defineConfig({
  plugins: [react()],
  server: { allowedHosts },
  build: {
    // Emit the modulepreload polyfill only when needed and keep the legacy
    // Safari chunk-loading fallback, which matters for a site that has to work
    // on whatever browser someone has when their DNS breaks.
    modulePreload: { polyfill: true },
    reportCompressedSize: true,
  },
})
