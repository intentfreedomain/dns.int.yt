# Intent-DNS

Authoritative DNS hosting with apex ALIAS support and a REST API on every plan.
This repository is the marketing site — the panel, API and DNS service are not
part of it.

- Site: <https://dns.int.yt/>
- Panel and API reference: <https://panel.dns.int.yt/>

## What the service does

The one thing that distinguishes it: a CNAME cannot exist at the apex of a zone,
because the apex is also the name in the zone's SOA and NS records. Hosting
platforms hand you a hostname, and without apex support you are stuck with a
subdomain or an A record pointing at an IP that changes.

An ALIAS record at the apex resolves like an A record while SOA and NS stay
where they belong:

```text
@   ALIAS   project.onrender.com.
@   NS      dns1.int.yt.
@   SOA     ns1.int.yt. hostmaster.int.yt. 1
```

## Plans

| | Free | Paid | Unlimited |
|---|---|---|---|
| Domain slots | 20 | 100 | Unlimited |
| DNS records per domain | 1,000 | 1,000 | Unlimited |
| REST API | Yes | Yes | Yes |
| ALIAS | Yes | Yes | Yes |
| Anycast nameservers | Yes | Yes | Yes |
| Price | $0 | $1/mo | $4/mo |

Paid tiers are enabled by hand — message an admin on Discord or by email.
For comparison, Cloudflare Free allows 200 records per zone (checked against
Cloudflare's DNS quota documentation, October 2026).

## Record types

`A` `AAAA` `ALIAS` `CNAME` `MX` `TXT` `SRV` `NS` `CAA`

ALIAS is rejected alongside `A`, `AAAA`, `CNAME` or a second ALIAS at the same
owner name. `NS`, `SOA`, `MX`, `TXT`, `SRV` and `CAA` are accepted there.

## Nameservers

Delegate to `dns1.int.yt` and `dns2.int.yt`.

Both names resolve to the same address, `192.255.149.52`, which is what makes
them anycast: one address announced from more than one network is answered by
whichever network the querier reaches first, so there is no fixed latency
penalty for being far from the origin. A unicast design would need two distinct
addresses.

Verify it yourself:

```bash
dig +short dns1.int.yt @1.1.1.1
dig +short dns2.int.yt @1.1.1.1
```

Authoritative answers come from PowerDNS Authoritative; a PowerDNS Recursor
handles ALIAS flattening and the lookups behind it.

## REST API

```text
https://dns.int.yt/api/v1
```

Authenticate with `Authorization: Bearer <token>`.

```bash
curl https://dns.int.yt/api/v1/domains \
  -H "Authorization: Bearer $IDNS_TOKEN"
```

| Method | Path | |
|---|---|---|
| `POST` | `/auth/token` | Exchange credentials for a token |
| `GET` | `/user` | Account and plan limits |
| `GET` `POST` | `/domains` | List / create zones |
| `GET` `DELETE` | `/domains/{id}` | Read / delete a zone |
| `GET` `POST` | `/domains/{id}/records` | List / create records |
| `PUT` `DELETE` | `/domains/{id}/records/{record_id}` | Replace / delete a record |

`https://panel.dns.int.yt/api-docs.php` is the authoritative reference for
request and response shapes.

## Developing the site

```bash
npm ci
npm run dev          # vite dev server
npm run build        # client bundle -> SSR bundle -> prerender
npm test             # vitest
npm run lint         # eslint
npm run format       # prettier
node scripts/verify-build.mjs   # post-build assertions
```

`npm run build` does three things in order:

1. `vite build` — client bundle into `dist/`
2. `vite build --ssr` — a server bundle into `.ssr/`
3. `scripts/prerender.mjs` — server-renders one static HTML file per route into
   `dist/`, writes `dist/404.html` (the GitHub Pages SPA fallback) and
   `dist/sitemap.xml`

Pages are prerendered because the site's whole job is being found and read by
things that do not run JavaScript. `src/components/Seo.jsx` only mirrors those
tags on client-side navigation.

### Single source of truth

Anything duplicated across pages, the sitemap, the JSON-LD or the README lives
in `src/data/`:

| File | Holds |
|---|---|
| `site.js` | Brand, URLs, nameservers, route list and their meta copy |
| `plans.js` | Plans, limits, comparison matrix |
| `records.js` | Record types with zone-file examples |
| `api.js` | Endpoint list |
| `schema.js` | JSON-LD graph, built from the above |

Change a price in `plans.js` and the pricing page, the comparison table, the
sitemap and the structured data all follow.

### Assets

`public/og.png` is a committed 1200x630 social card, regenerated on Windows with
`scripts/gen-og.ps1`. Fonts are bundled from `@fontsource-variable/*` — there
are no third-party requests at runtime. Icons are inlined SVG in
`src/components/icons.js`.

## Deploying

Pushes to `main` run lint, tests and a build, then deploy `dist/` to GitHub
Pages behind the custom domain in `public/CNAME`.

`404.html` must exist and must be the *shell* — not a prerendered page. GitHub
Pages serves it for any unmatched path, and the client router then renders the
route the visitor actually asked for.

## Contributing

Issues and pull requests are welcome. For bugs, include the `dig` output or API
response that reproduces the problem. Never paste passwords, API tokens,
session cookies or private keys.

## Contact

- Discord: <https://discord.gg/NCS96PS4MH>
- Email: admin@int.yt

## License

[MIT](LICENSE)