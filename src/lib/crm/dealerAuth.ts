// Client-side helper for the dealer portal (/login, /signup, /dashboard) —
// every call here goes straight to the CRM's own API, browser to server,
// credentials included so the CRM's dealer_session cookie rides along. This
// app never sees or stores the dealer's application data itself.
export const CRM_API_URL = process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost:4000'

export async function crmFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${CRM_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}
