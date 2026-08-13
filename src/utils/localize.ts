import { Language } from './typeDef';

/**
 * Picks the right-language variant of a translated field coming from the API.
 *
 * The backend stores each translated field as three sibling columns
 * (`title_fr`, `title_en`, `title_ar`). Responses are inconsistent about
 * casing — some endpoints serialise the raw column name (`title_fr`) and
 * others camel-case it (`titleFr`) — and existing call sites already worked
 * around that with `record.titleFr ?? record.title_fr`. Both spellings are
 * tried here so callers don't have to repeat that.
 *
 * Arabic falls back to English, never to French: Arabic was added after these
 * tables already held content, so `*_ar` is null on every pre-existing row and
 * will stay null until someone fills it in through the admin. English is the
 * more widely readable of the two remaining options for that audience.
 */

/** `ctaText` -> `cta_text`, so the snake_case column name can be derived. */
const toSnake = (base: string) => base.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const suffixed = (base: string, lang: Language) => [
  // camelCase: title + Ar -> titleAr
  `${base}${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
  // snake_case: cta_text + _ar -> cta_text_ar
  `${toSnake(base)}_${lang}`,
];

function readVariant(source: Record<string, any>, base: string, lang: Language): any {
  for (const key of suffixed(base, lang)) {
    const value = source[key];
    // Treat '' and [] as absent: a row saved through the admin with an empty
    // Arabic box should fall back to English, not render as a blank heading.
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return value;
  }
  return undefined;
}

/**
 * @param source  the API record, or null/undefined while it is still loading
 * @param base    field name without the language suffix, camelCase ('ctaText')
 * @param lang    currently selected language
 * @param fallback value when neither the requested language nor English exists
 */
export function localized(
  source: Record<string, any> | null | undefined,
  base: string,
  lang: Language,
  fallback = ''
): string {
  if (!source) return fallback;
  const value = readVariant(source, base, lang) ?? readVariant(source, base, 'en');
  return typeof value === 'string' ? value : fallback;
}

/** Array-valued equivalent, for the `features_*` json columns. */
export function localizedList(
  source: Record<string, any> | null | undefined,
  base: string,
  lang: Language,
  fallback: string[] = []
): string[] {
  if (!source) return fallback;
  const value = readVariant(source, base, lang) ?? readVariant(source, base, 'en');
  return Array.isArray(value) ? value : fallback;
}
