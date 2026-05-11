const API_URL =
  process.env.NEXT_PUBLIC_EVENTS_API_URL ||
  "https://script.google.com/macros/s/AKfycbzwkdsn95MkUUw6WVeri05Rzfj4U3sEOpjbHegBTqNXkcg7sYKhYdyqQLlZATmYQ3GgdA/exec";

const API_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
}

export type RawEvent = {
  date: string;
  name: string;
  place: string;
  type: string;
  description: string;
  notes: string;
  drive_url: string;
  thumbnail_url: string;
  image_credit: string;
  announcement_url: string;
  announcement_title: string;
  announcement_date: string;
  attendance_estimated: string | number;
  attendance_confirmed: string | number;
  media_photos: number | string;
  media_videos: number | string;
  tags: string[];
  organizers: { name: string; website?: string; role: string }[];
  contacts: string;
  social_hashtags: string;
  media_features: string[] | string;
};

export type EventDisplay = {
  date: string;
  name: string;
  place: string;
  type: string;
  thumbnail: string;
  image_credit: string;
  announcement_url: string;
  announcement_title: string;
  organizers: { name: string; website?: string; role: string }[];
  media_features: string[];
  tags: string[];
};

export function parseEvents(
  raw: RawEvent[],
  thumbnailMap: Record<string, string>,
): EventDisplay[] {
  return raw
    .map((e) => ({
      date: e.date,
      name: e.name,
      place: e.place,
      type: e.type,
      thumbnail: thumbnailMap[e.date] || "",
      image_credit: e.image_credit || "",
      announcement_url: e.announcement_url,
      announcement_title: e.announcement_title,
      organizers: e.organizers,
      media_features: Array.isArray(e.media_features)
        ? e.media_features
        : [],
      tags: e.tags,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchEvents(): Promise<EventDisplay[]> {
  try {
    const res = await fetchWithTimeout(API_URL, API_TIMEOUT_MS);
    if (!res.ok) return [];
    const raw: RawEvent[] = await res.json();
    return parseEvents(raw, {});
  } catch {
    return [];
  }
}
