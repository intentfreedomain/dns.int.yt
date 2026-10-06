#!/usr/bin/env bash
# path: ./dev-tunnel.sh  (project root, alongside package.json)
#
# Runs the Vite dev server AND exposes it via a free, no-signup Cloudflare
# Quick Tunnel — for showing the site to someone remotely without deploying.
# The URL is random (*.trycloudflare.com), temporary, and dies when you stop
# this script. Not for production — just for quick "hey look at this" links.
#
# Requires: cloudflared
#   macOS:   brew install cloudflared
#   Linux:   see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
#   Windows: winget install cloudflare.cloudflared

set -euo pipefail

PORT="${PORT:-5173}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Install it first — see the comments at the top of this script." >&2
  exit 1
fi

# Cloudflare Quick Tunnels hand out a random *.trycloudflare.com subdomain each
# run, so Vite has to accept that whole domain rather than one host.
# vite.config.js reads DEV_ALLOWED_HOSTS and trusts nothing when it is unset, so
# this has to be exported before the dev server starts.
export DEV_ALLOWED_HOSTS="${DEV_ALLOWED_HOSTS:-.trycloudflare.com}"

echo "Starting Vite dev server on port $PORT..."
npm run dev -- --port "$PORT" --strictPort &
VITE_PID=$!

# Wait for Vite to actually answer instead of guessing with a sleep, so the
# tunnel never attaches to a port that is not listening yet.
for _ in $(seq 1 50); do
  if curl -sf "http://localhost:$PORT/" -o /dev/null; then
    break
  fi
  if ! kill -0 "$VITE_PID" 2>/dev/null; then
    echo "Vite exited before it started listening." >&2
    exit 1
  fi
  sleep 0.2
done

if ! curl -sf "http://localhost:$PORT/" -o /dev/null; then
  echo "Vite did not start listening on port $PORT." >&2
  kill "$VITE_PID" 2>/dev/null || true
  exit 1
fi

echo "Starting Cloudflare Quick Tunnel (no login required)..."
echo "Look for a line like: https://random-words-here.trycloudflare.com"
cloudflared tunnel --url "http://localhost:$PORT" --no-autoupdate &
TUNNEL_PID=$!

cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$VITE_PID" "$TUNNEL_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

wait