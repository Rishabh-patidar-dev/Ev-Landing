// Local-disk replacement for Supabase Storage — no external service, no
// keys. Files live outside `public/` (never directly web-served), gated
// behind the signed-path token below plus the session check each route
// already does.
//
// UPLOADS_DIR lets this point at a mounted persistent disk in production
// (e.g. Render: attach a disk at /data, set UPLOADS_DIR=/data/uploads) —
// without it, uploads land on the deploy's local filesystem, which most
// hosts wipe on every redeploy/restart. Defaults to `.uploads/` next to
// the project for local dev.
import "server-only";
import path from "path";
import crypto from "crypto";

const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), ".uploads");

/** Resolves a storage-relative path to an absolute one, rejecting traversal. */
export function resolveUploadPath(relativePath: string): string {
  const resolved = path.join(UPLOADS_ROOT, relativePath);
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    throw new Error("Invalid path");
  }
  return resolved;
}

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not configured");
  return s;
}

/** Short-lived signature so the blob PUT/GET endpoints trust the path they're given. */
export function signBlobPath(relativePath: string): string {
  return crypto.createHmac("sha256", secret()).update(relativePath).digest("hex").slice(0, 32);
}

export function verifyBlobPath(relativePath: string, token: string): boolean {
  const expected = signBlobPath(relativePath);
  const a = Buffer.from(expected);
  const b = Buffer.from(token || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
