export const TIER_MAP: Record<number, number> = {
  250:  250,
  500:  490,
  750:  730,
  1000: 920,
  1250: 1140,
  1500: 1360,
  1750: 1500,
  2000: 1710,
  2250: 1910,
  2500: 2050,
  2750: 2250,
  3000: 2460,
};

export const TIER_KEYS = Object.keys(TIER_MAP).map(Number).sort((a, b) => a - b);
export const MAX_TIER = TIER_KEYS[TIER_KEYS.length - 1];
