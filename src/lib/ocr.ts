// Plain-text OCR only, a direct port of
// EV-CRM-/apps/api/src/services/ocr.service.ts — same reasoning applies:
// fully offline via tesseract.js, worker created/terminated per call since
// this app has no background-job infra either.
import "server-only";
import { createWorker } from "tesseract.js";

export async function extractText(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
