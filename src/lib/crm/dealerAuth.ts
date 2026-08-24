// Client-side helper for the dealer portal (/login, /signup, /dashboard) —
// every call here goes straight to the CRM's own API, browser to server,
// credentials included so the CRM's dealer_session cookie rides along. This
// app never sees or stores the dealer's application data itself.
//
// Strip a trailing slash defensively — a NEXT_PUBLIC_CRM_API_URL like
// "https://host.com/" plus a path like "/api/v1/..." produces a double
// slash, which most routers 404 on. Same normalization DMS's copy of this
// helper already does.
export const CRM_API_URL = (process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost:4000').replace(/\/+$/, '')

export async function crmFetch(path: string, init?: RequestInit) {
  try {
    const res = await fetch(`${CRM_API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch (error) {
    // fetch() throws (not a rejected-with-response) on network failure or a
    // CORS-blocked request — the browser gives no other detail either way.
    // Without this catch, that exception propagated up out of every caller's
    // async onSubmit unhandled: react-hook-form swallows it, isSubmitting
    // resets, and the button silently goes back to normal with no error
    // shown and no navigation — exactly "the button does nothing."
    console.error('[crmFetch] request failed:', path, error)
    return { ok: false, status: 0, data: { message: "Can't reach the server. Check your connection and try again." } }
  }
}
