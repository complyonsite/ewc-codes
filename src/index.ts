import { data } from './data.js';

/** WM3 Appendix A: absolute hazardous/non-hazardous and mirror hazardous/non-hazardous. */
export type EntryType = 'AH' | 'AN' | 'MH' | 'MN';
export interface Heading {
  readonly code: string;
  readonly display: string;
  readonly title: string;
}
export interface EwcEntry {
  readonly code: string;
  readonly display: string;
  /** Whether the List of Waste marks this entry with an asterisk. */
  readonly hazardous: boolean;
  readonly type: EntryType;
  readonly description: string;
  readonly note?: string;
  readonly chapter: Heading;
  readonly subChapter: Heading;
  /** Explicit List of Waste / GOV.UK construction guide links; can contain several codes. */
  readonly mirrorPartners: readonly string[];
  /** Broader sub-chapter candidates, not explicit mirror pairs; see SOURCES.md. */
  readonly subChapterPartners: readonly string[];
}

/** All 842 entries in code order. Frozen so consumers cannot corrupt later lookups. */
export const entries: readonly EwcEntry[] = Object.freeze(data.map(entry => Object.freeze({
  ...entry,
  chapter: Object.freeze(entry.chapter),
  subChapter: Object.freeze(entry.subChapter),
  mirrorPartners: Object.freeze(entry.mirrorPartners),
  subChapterPartners: Object.freeze(entry.subChapterPartners),
})));
const byCode = new Map(entries.map(entry => [entry.code, entry]));
export const chapters: readonly Heading[] = Object.freeze([...new Map(entries.map(entry => [entry.chapter.code, entry.chapter])).values()]);
export const subChapters: readonly Heading[] = Object.freeze([...new Map(entries.map(entry => [entry.subChapter.code, entry.subChapter])).values()]);

/** Accept six digits or three two-digit groups separated by spaces, hyphens or dots, with an optional *. */
export function validateCodeFormat(input: string): boolean {
  return normaliseCode(input) !== undefined;
}

/** Normalise syntax only. Does not check that a code exists or that a supplied * is correct. */
export function normaliseCode(input: string): string | undefined {
  const match = /^\s*(?:(\d{6})|(\d{2})([ .-])\s*(\d{2})\3\s*(\d{2}))\s*\*?\s*$/.exec(input);
  return match ? match[1] ?? match[2] + match[4] + match[5] : undefined;
}

/** Look up a code; undefined for malformed or unlisted codes. */
export function lookup(input: string): EwcEntry | undefined {
  const code = normaliseCode(input);
  return code ? byCode.get(code) : undefined;
}

/** Asterisk status of the listed entry; undefined for unknown codes (never silently false). */
export function isHazardous(input: string): boolean | undefined {
  return lookup(input)?.hazardous;
}

/** Explicit mirror partners only; [] for unknown, absolute or unpaired entries. */
export function mirrorPartners(input: string): readonly EwcEntry[] {
  return (lookup(input)?.mirrorPartners ?? []).map(code => byCode.get(code)!);
}

/** Official-text search: exact codes, code prefixes, or all query words in description/headings. Empty query returns []. */
export function search(query: string): readonly EwcEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (validateCodeFormat(trimmed)) {
    const entry = lookup(trimmed);
    return entry ? [entry] : [];
  }
  if (/^\d[\d .-]*$/.test(trimmed)) {
    const prefix = trimmed.replace(/[ .-]/g, '');
    return entries.filter(entry => entry.code.startsWith(prefix));
  }
  const words = trimmed.toLowerCase().split(/\s+/);
  return entries.filter(entry => {
    const text = `${entry.description} ${entry.chapter.title} ${entry.subChapter.title}`.toLowerCase();
    return words.every(word => text.includes(word));
  });
}

/** Human-readable reference for an existing code. */
export function referenceUrl(input: string): string | undefined {
  const entry = lookup(input);
  return entry ? `https://complyonsite.com/tools/ewc-code-finder?code=${entry.code.slice(0, 2)}-${entry.code.slice(2, 4)}-${entry.code.slice(4)}` : undefined;
}
