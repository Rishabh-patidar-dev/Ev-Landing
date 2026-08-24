// Upload entry point for /api/apply/upload — a direct port of
// EV-CRM-/apps/api/src/services/fileStorage.service.ts so the no-login
// Apply wizard's document uploads land in the SAME Supabase Storage
// bucket/project the rest of the app already uses, instead of this app's
// own ephemeral local disk (which doesn't survive most deployed hosts).
// Branches at call time on whether real Supabase credentials are
// configured; falls back to the existing local-disk writer (localBlob.ts)
// when they're not, so local dev keeps working with zero Supabase setup.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { resolveUploadPath } from "./localBlob";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "attachments";

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

export interface UploadedFile {
  url: string;
  path: string;
}

// `key` is a storage path the caller builds, e.g.
// "applications/{sessionId}/{docKey}/{timestamp}_{filename}".
export async function uploadFile(buffer: Buffer, key: string, mimeType?: string): Promise<UploadedFile> {
  if (supabase) {
    const { error } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(key, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
    const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(key);
    return { url: data.publicUrl, path: key };
  }

  // Local-disk fallback — dev only, does not survive most deployed hosts.
  const absolute = resolveUploadPath(key);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, buffer);
  return { url: "", path: key };
}

export function isUsingRealStorage(): boolean {
  return supabase !== null;
}
