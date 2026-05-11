import "server-only";
import type { RawEvent } from "./events";

const API_URL =
  process.env.NEXT_PUBLIC_EVENTS_API_URL ||
  "https://script.google.com/macros/s/AKfycbzwkdsn95MkUUw6WVeri05Rzfj4U3sEOpjbHegBTqNXkcg7sYKhYdyqQLlZATmYQ3GgdA/exec";

const API_TIMEOUT_MS = 10_000;
const THUMBNAIL_TIMEOUT_MS = 15_000;

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
}

export async function fetchRawEvents(): Promise<RawEvent[]> {
  try {
    const res = await fetchWithTimeout(API_URL, API_TIMEOUT_MS);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function processEventThumbnails(
  events: RawEvent[],
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};

  try {
    const sharp = (await import("sharp")).default;
    const { mkdir } = await import("fs/promises");
    const path = await import("path");

    await mkdir(path.join(process.cwd(), "public/events"), {
      recursive: true,
    });

    for (const event of events) {
      if (!event.thumbnail_url) continue;
      try {
        const res = await fetchWithTimeout(event.thumbnail_url, THUMBNAIL_TIMEOUT_MS);
        if (!res.ok) continue;
        const buffer = Buffer.from(await res.arrayBuffer());
        const outputPath = path.join(
          process.cwd(),
          `public/events/${event.date}.jpg`,
        );
        await sharp(buffer).resize(800).jpeg({ quality: 80 }).toFile(outputPath);
        map[event.date] = `/events/${event.date}.jpg`;
      } catch {
        // Skip failed downloads
      }
    }
  } catch {
    // sharp not available — skip all thumbnails
  }

  return map;
}
