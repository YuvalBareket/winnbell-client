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
// campaign capacity/volume only, never implies any entry is worth more than another
// or that more entries improve winning odds.
export const PLAN_META: Record<number, PlanMeta> = {
  1000: {
    name: 'Low Volume',
    tagline: 'For lower-traffic locations',
    features: ['Map visibility while active', 'Campaign setup & tracking tools', 'Winnbell campaign administration'],
  },
  2500: {
    name: 'Medium Volume',
    tagline: 'For steady customer traffic',
    popular: true,
    features: ['Everything in Low Volume', 'Increased campaign capacity', 'Better fit for active locations'],
  },
  5000: {
    name: 'High Volume',
    tagline: 'For busy businesses',
    features: ['Everything in Medium Volume', 'Highest standard capacity', 'Built for busy locations'],
  },
};

// ─── Founding fallbacks ───────────────────────────────────────────────────────
// The server is the source of truth (server shared/founding.ts, served via the
// founding-availability endpoint). These fallbacks are used only until availability
// data loads - KEEP IN LOCKSTEP with the server file.
export const FOUNDING_TERM_MONTHS = 3;
export const FOUNDING_RENEWAL_TERM_MONTHS = 12;
// The founding offer is a MONTHLY RATE per location; the one-time charge is rate x term.
export const FOUNDING_MONTHLY_PRICE_PER_LOCATION = 100;
export const FOUNDING_PRICE_PER_LOCATION = FOUNDING_MONTHLY_PRICE_PER_LOCATION * FOUNDING_TERM_MONTHS;
