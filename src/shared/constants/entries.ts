// Maximum entries a single receipt can earn, regardless of amount spent.
// Must stay in sync with MAX_ENTRIES_PER_RECEIPT in server/src/features/tickets/tickets.service.ts
export const MAX_ENTRIES_PER_RECEIPT = 3;

// Hard per-user cap on total entries in a single draw/campaign, across ALL entry types.
// Must stay in sync with MAX_ENTRIES_PER_DRAW in server/src/features/tickets/tickets.service.ts
export const MAX_ENTRIES_PER_DRAW = 30;
