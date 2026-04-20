/**
 * Central query key registry.
 *
 * Rules:
 *  - Static keys: plain tuples (`['scope', 'sub']`)
 *  - Dynamic keys: factory functions that return tuples
 *  - Parent keys (`all`) let you invalidate an entire domain:
 *      queryClient.invalidateQueries({ queryKey: queryKeys.business.all })
 *    …will also invalidate myDetails, stats, etc.
 */

export const queryKeys = {
  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: {
    all:        ['admin']                        as const,
    businesses: ['admin', 'businesses']          as const,
    draws:      ['admin', 'draws']               as const,
    drawsAll:   ['admin', 'draws-all']           as const,
    overview:   ['admin', 'overview']            as const,
    users:      ['admin', 'users']               as const,
  },

  // ─── Business (partner) ───────────────────────────────────────────────────
  business: {
    all:       ['business']                      as const,
    myDetails: ['business', 'my-details']        as const,
    stats: (locationId?: number | null, drawId?: number | null) =>
      ['business', 'stats', locationId ?? 'all', drawId ?? 'all'] as const,
  },

  // ─── Draws (user-facing) ──────────────────────────────────────────────────
  draws: {
    all:     ['draws']            as const,
    active:  ['draws', 'active']  as const,
    history: ['draws', 'history'] as const,
  },

  // ─── Subscription ─────────────────────────────────────────────────────────
  subscription: {
    all: ['subscription'] as const,
  },

  // ─── Tickets ──────────────────────────────────────────────────────────────
  tickets: {
    all:        ['tickets']                                    as const,
    mine:       (drawId?: number) =>
      ['tickets', 'mine', drawId ?? 'all']                    as const,
    freeStatus: ['tickets', 'free-status']                    as const,
  },

  // ─── Participating businesses (v2 entry) ──────────────────────────────────
  participating: {
    all: ['participating'] as const,
  },
} as const;
