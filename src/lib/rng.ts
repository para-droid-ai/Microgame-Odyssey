export function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function stringToSeed(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return h;
}

export function generateRunSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let seed = '';
  for (let i = 0; i < 4; i++) seed += chars.charAt(Math.floor(Math.random() * chars.length));
  seed += '-';
  for (let i = 0; i < 2; i++) seed += chars.charAt(Math.floor(Math.random() * chars.length));
  return seed;
}
