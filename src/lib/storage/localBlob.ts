// Local-disk storage for apply-wizard document uploads — no external
// service, no keys. Files live outside `public/` (never directly
// web-served) under `.uploads/`, read back only via /api/apply/upload's
// own GET handler.
import "server-only";
import path from "path";

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
