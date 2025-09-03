const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ12345678';

export function generateRandomString(length = 6) {
  let code = '';
  // Use crypto‑secure random when available, otherwise Math.random()
  const random =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? () => crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff
      : Math.random;

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(random() * ALPHABET.length);
    code += ALPHABET[idx];
  }

  return code;
}

export function windowAround<T>(arr: T[], matcher: T | ((item: T) => boolean), before = 2, after = 2): T[] {
  const isMatch =
    typeof matcher === 'function' ? (matcher as (item: T) => boolean) : (item: T) => Object.is(item, matcher);

  const idx = arr.findIndex(isMatch);

  if (idx === -1) {
    return arr.slice(0, before + after + 1);
  }

  const start = Math.max(0, idx - before);
  const end = Math.min(arr.length, idx + after + 1);

  return arr.slice(start, end);
}

export function weekBounds(ts: number | string | Date) {
  const center = new Date(ts);
  const dow = center.getDay();

  const lastMon = new Date(center);
  lastMon.setDate(center.getDate() - ((dow + 6) % 7));
  lastMon.setHours(0, 0, 0, 0);

  const nextSun = new Date(center);
  nextSun.setDate(center.getDate() + ((7 - dow) % 7));
  nextSun.setHours(23, 59, 59, 0);

  return { lastMonday: lastMon, nextSunday: nextSun };
}
