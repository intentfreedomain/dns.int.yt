// Supported record types. Drives the home-page chips, the /dns-records explorer
// and the README table — one definition, three renderers.
//
// `example` is a real zone-file line (owner name, type, rdata) so the explorer
// shows something a user can paste into their own zone.

export const RECORDS = [
  {
    type: 'A',
    name: '@',
    content: '203.0.113.42',
    ttl: 3600,
    summary: 'Point a hostname at an IPv4 address.',
    detail:
      'The most common record type. An A record maps a name directly to an IPv4 address and returns it to the client without any further lookup.',
    highlight: false,
  },
  {
    type: 'AAAA',
    name: '@',
    content: '2606:4700:4700::1111',
    ttl: 3600,
    summary: 'Point a hostname at an IPv6 address.',
    detail:
      'The IPv6 counterpart to A. Publish it alongside an A record so clients that resolve over IPv6 get a direct answer instead of falling back through NAT64.',
    highlight: false,
  },
  {
    type: 'ALIAS',
    name: '@',
    content: 'your-project.onrender.com.',
    ttl: 3600,
    summary: 'Point the zone apex at a hostname — where CNAME is not allowed.',
    detail:
      'A CNAME cannot exist at the apex of a zone, because a zone apex must also carry SOA and NS records. ALIAS solves that: keep your SOA and NS where they belong and point the apex at any hostname, which resolves like an A record.',
    highlight: true,
  },
  {
    type: 'CNAME',
    name: 'www',
    content: 'yourdomain.int.yt.',
    ttl: 3600,
    summary: 'Alias one hostname to another.',
    detail:
      'Standard canonical-name aliasing. Works at any name below the apex, and cannot be combined with other record types at the same owner name.',
    highlight: false,
  },
  {
    type: 'MX',
    name: '@',
    content: '10 mail.provider.com.',
    ttl: 3600,
    summary: 'Route inbound email, with priority ordering.',
    detail:
      'Lower preference numbers win. Every domain that receives mail needs an MX record at the apex, or senders have nowhere to deliver.',
    highlight: false,
  },
  {
    type: 'TXT',
    name: '@',
    content: '"v=spf1 include:_spf.provider.com -all"',
    ttl: 3600,
    summary: 'Free-form text for SPF, DKIM and domain verification.',
    detail:
      'Carries SPF policies, DKIM public keys, DMARC reports and ownership-verification tokens from services like Google Workspace or Cloudflare.',
    highlight: false,
  },
  {
    type: 'SRV',
    name: '_service._tcp',
    content: '10 5 5060 target.com.',
    ttl: 3600,
    summary: 'Advertise a service host and port for discovery.',
    detail:
      'Priority, weight, port and target. Used by XMPP, Matrix and SIP, and increasingly by Kubernetes service discovery.',
    highlight: false,
  },
  {
    type: 'NS',
    name: 'sub',
    content: 'ns1.otherprovider.com.',
    ttl: 86400,
    summary: 'Delegate a subzone to a different set of nameservers.',
    detail:
      'Delegates a subdomain to another operator. A long TTL matters here: lowering it forces every resolver in the world to re-query the child delegation.',
    highlight: false,
  },
  {
    type: 'CAA',
    name: '@',
    content: '0 issue "letsencrypt.org"',
    ttl: 3600,
    summary: 'Restrict which certificate authorities may issue for your domain.',
    detail:
      'A CAA record tells public CAs which of themselves are allowed to issue certificates for your domain. Setting it is the cheapest defence against mis-issuance.',
    highlight: false,
  },
]

// Records that may coexist with an ALIAS at the same owner name. ALIAS
// validation rejects A, AAAA, CNAME and duplicate ALIAS targets there.
export const ALIAS_CONFLICTS = ['A', 'AAAA', 'CNAME', 'ALIAS (duplicate target)']

export const ALIAS_COEXIST = ['NS', 'SOA', 'MX', 'TXT', 'SRV', 'CAA']

export const recordCount = RECORDS.length
