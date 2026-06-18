const NAVIGO_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function compactSource(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function buildDigitGroups(seed: string) {
  let state = 0;

  for (const char of seed) {
    state = (state * 33 + char.charCodeAt(0)) % 1_000_000_007;
  }

  const groups = [
    ((state % 9) + 1).toString(),
    (Math.floor(state / 9) % 1000).toString().padStart(3, '0'),
    (Math.floor(state / 9000) % 1000).toString().padStart(3, '0'),
    (Math.floor(state / 9_000_000) % 1000).toString().padStart(3, '0'),
  ];

  return groups;
}

function buildSuffix(seed: string) {
  let letterIndex = 0;

  for (const char of seed) {
    letterIndex = (letterIndex + char.charCodeAt(0)) % NAVIGO_LETTERS.length;
  }

  return NAVIGO_LETTERS[letterIndex];
}

export function buildNavigoNumber(seedSource: string) {
  const seed = compactSource(seedSource);
  const groups = buildDigitGroups(seed);
  const suffix = buildSuffix(seed);

  return `${groups[0]} ${groups[1]} ${groups[2]} ${groups[3]} ${suffix}`;
}

export function normalizeNavigoNumber(value: string | null | undefined) {
  return (value ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function formatNavigoNumber(value: string) {
  const normalized = normalizeNavigoNumber(value);

  if (normalized.length < 11) {
    return value.trim().toUpperCase();
  }

  const digits = normalized.slice(0, 10);
  const suffix = normalized.slice(10, 11);

  return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)} ${suffix}`;
}

export function isMaskedNavigoNumber(value: string | null | undefined) {
  return (value ?? '').includes('*');
}
