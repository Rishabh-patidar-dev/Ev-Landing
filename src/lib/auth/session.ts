// Portal session — direct-to-Postgres auth (Account model + bcrypt + JWT
// cookie), replacing the earlier Supabase Auth integration. Same mechanism
// as the CRM's staff login, deliberately kept on its own secret/cookie name
// since dealers/OEM staff and CRM staff are different trust domains.
import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
export const SESSION_COOKIE = "portal_session";
const SHORT_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const LONG_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30d

export type SessionPayload = {
  sub: string; // Account.id
  username: string;
  fullName: string;
  role: string; // "dealer" | "oem_admin" | "super_admin"
};

export function signSession(account: SessionPayload, ttlMs = SHORT_TTL_MS): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(account, JWT_SECRET, { expiresIn: Math.floor(ttlMs / 1000) });
}

export function sessionMaxAge(remember: boolean) {
  return remember ? LONG_TTL_MS : SHORT_TTL_MS;
}

/** Server Components / Route Handlers only — reads + verifies the cookie. */
export async function getSession(): Promise<SessionPayload | null> {
  if (!JWT_SECRET) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
