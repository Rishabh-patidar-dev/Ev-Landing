// Client-side helper for the dealer portal (/login, /signup, /dashboard) —
// every call here goes straight to the CRM's own API, browser to server.
// This app never sees or stores the dealer's application data itself.
//
// Strip a trailing slash defensively — a NEXT_PUBLIC_CRM_API_URL like
// "https://host.com/" plus a path like "/api/v1/..." produces a double
// slash, which most routers 404 on. Same normalization DMS's copy of this
// helper already does.
export const CRM_API_URL = (process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost:4000').replace(/\/+$/, '')

// The dealer_session cookie is still sent (credentials: 'include') for
// browsers where it works, but it's a cross-site cookie by construction —
// this app and the API are on two different deployed domains. Modern
// browsers increasingly block that kind of cookie by default, which shows
// up as: login/signup succeed, then the very next request looks signed-out.
// The token below is the real, unblockable session carrier — stored here
// after login/signup, sent as an Authorization header on every call.
const TOKEN_KEY = 'dealer_token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function storeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage unavailable (private mode etc.) — session then relies
    // solely on the cookie, same as before this fix existed.
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // nothing to do — see storeToken
  }
}

export async function crmFetch(path: string, init?: RequestInit) {
  try {
    const token = getStoredToken()
    const res = await fetch(`${CRM_API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
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
