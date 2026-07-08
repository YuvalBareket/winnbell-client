// Client mirror of the server's TIER_PRICE_MAP (server/src/features/stripe/stripe.service.ts).
// Keep the two in lockstep: entries_per_location -> monthly price per location.
export const TIER_MAP: Record<number, number> = {
  1000: 250,  // Starter
  2500: 450,  // Growth (most popular)
  5000: 750,  // Pro
};

export const TIER_KEYS = Object.keys(TIER_MAP).map(Number).sort((a, b) => a - b);
export const MAX_TIER = TIER_KEYS[TIER_KEYS.length - 1];

export interface PlanMeta {
  name: string;
  tagline: string;
  popular?: boolean;
  features: string[];
}

// Display metadata for the 3-card plan picker. Copy stays compliant: describes
// volume/value, never implies more entries improve winning odds.
export const PLAN_META: Record<number, PlanMeta> = {
  1000: {
    name: 'Starter',
    tagline: 'For a quieter location',
    features: ['On the Winnbell map', 'Entries every campaign'],
  },
  2500: {
    name: 'Growth',
    tagline: 'Where most shops start',
    popular: true,
    features: ['Everything in Starter', 'Best value per entry'],
  },
  5000: {
    name: 'Pro',
    tagline: 'High-traffic and multi-branch',
    features: ['Everything in Growth', 'Maximum entry volume'],
  },
};
