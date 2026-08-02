// Maximum entries a single receipt can earn, regardless of amount spent.
// Must stay in sync with MAX_ENTRIES_PER_RECEIPT in server/src/features/tickets/tickets.service.ts
export const MAX_ENTRIES_PER_RECEIPT = 3;

// Hard per-user cap on total entries in a single draw/campaign, across ALL entry types.
// Must stay in sync with MAX_ENTRIES_PER_DRAW in server/src/features/tickets/tickets.service.ts
export const MAX_ENTRIES_PER_DRAW = 30;

// Lowest allowed "minimum spend per receipt" a business can set.
// Must stay in sync with MIN_RECEIPT_THRESHOLD in server/src/features/business/business.controller.ts
export const MIN_RECEIPT_THRESHOLD = 10;

// Sector whose entries are restricted to participants aged 21+ (tobacco & liquor businesses).
// Must stay in sync with AGE_RESTRICTED_SECTOR in server/src/shared/ageRestriction.ts
export const AGE_RESTRICTED_SECTOR = 'Liquor';
