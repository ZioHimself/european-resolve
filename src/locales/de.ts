import type { Locale } from "./types";
import { en } from "./en";

const emptyKeys = Object.fromEntries(
  Object.keys(en).map((key) => [key, ""]),
) as Record<keyof Locale, string>;

export const de: Locale = { ...emptyKeys };
