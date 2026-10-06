// The API surface, as documented. `/api-docs.php` on the panel is the
// authoritative reference; this list exists so the landing page can never
// demo a path that does not exist.

export const AUTH_METHOD = 'Bearer token'

export const TOKEN_PREFIX = 'idns_live_'

export const ENDPOINTS = [
  {
    method: 'POST',
    path: '/auth/token',
    group: 'Authentication',
    summary: 'Exchange credentials for an API token.',
  },
  {
    method: 'GET',
    path: '/user',
    group: 'Account',
    summary: 'Return the authenticated account and its plan limits.',
  },
  { method: 'GET', path: '/domains', group: 'Domains', summary: 'List domains on the account.' },
  { method: 'POST', path: '/domains', group: 'Domains', summary: 'Create a zone.' },
  { method: 'GET', path: '/domains/{id}', group: 'Domains', summary: 'Return a single zone.' },
  {
    method: 'DELETE',
    path: '/domains/{id}',
    group: 'Domains',
    summary: 'Delete a zone and its records.',
  },
  {
    method: 'GET',
    path: '/domains/{id}/records',
    group: 'Records',
    summary: 'List the records in a zone.',
  },
  { method: 'POST', path: '/domains/{id}/records', group: 'Records', summary: 'Create a record.' },
  {
    method: 'PUT',
    path: '/domains/{id}/records/{record_id}',
    group: 'Records',
    summary: 'Replace a record.',
  },
  {
    method: 'DELETE',
    path: '/domains/{id}/records/{record_id}',
    group: 'Records',
    summary: 'Delete a record.',
  },
]

// Sample payload for the terminal demo, shaped like a real records response.
export const RECORDS_RESPONSE_SAMPLE = {
  domain: 'yourdomain.int.yt',
  records: 847,
  limit: 1000,
  status: 'active',
}
