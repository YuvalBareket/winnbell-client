/**
 * Central query key registry.
 *
 * Rules:
 *  - Static keys: plain tuples (`['scope', 'sub']`)
 *  - Dynamic keys: factory functions that return tuples
 *  - Parent keys (`all`) let you invalidate an entire domain:
 *      queryClient.invalidateQueries({ queryKey: queryKeys.business.all })
 *    ...will also invalidate myDetails, stats, etc.
 */

export const queryKeys = {
  // --- Admin ---------------------------------------------------------------
  admin: {
    all:        ['admin']                        as const,
    businesses: ['admin', 'businesses']          as const,
    healthSummary: ['admin', 'health-summary']   as const,
    draws:      ['admin', 'draws']               as const,
    drawsAll:   ['admin', 'draws-all']           as const,
    overview:   ['admin', 'overview']            as const,
    users:      ['admin', 'users']               as const,
    userAnalyticsSummary: ['admin', 'users-analytics-summary'] as const,
    platformSettings:     ['admin', 'platform-settings']    as const,
    notificationHistory:  ['admin', 'notification-history'] as const,
    campaignComparison:   ['admin', 'campaign-comparison']  as const,
    growthAnalytics:      ['admin', 'growth-analytics']     as const,
    // prefix keys for broad invalidation (no id = invalidates all variants)
    userDetailAll:     ['admin', 'user-detail']    as const,
    businessDetailAll: ['admin', 'business-detail'] as const,
    // per-entity factories
    funnel:          (days: number)             => ['admin', 'funnel', days]                          as const,
    drawCandidate:   (drawId: number | null)    => ['admin', 'draw-candidate',   drawId]             as const,
    drawRejected:    (drawId: number | null)    => ['admin', 'draw-rejected',    drawId]             as const,
    drawWinnerOrder: (drawId: number | null)    => ['admin', 'draw-winner-order', drawId]            as const,
    mapLocations:    (boundsKey: string)        => ['admin', 'map-locations',    boundsKey]          as const,
    drawAudit:       (drawId: number | null)    => ['admin', 'draw-audit',       drawId]             as const,
    drawBusinesses:  (drawId: number | null, search: string, sector: string) =>
      ['admin', 'draw-businesses', drawId, search, sector] as const,
    // Prefix form: invalidates every search/sector variant for a draw at once.
    drawBusinessesAll: (drawId: number | null) => ['admin', 'draw-businesses', drawId] as const,
    analytics:       (businessId: number | null, drawId: number | null) =>
      ['admin', 'analytics', businessId, drawId] as const,
    entryVolume:     (drawId: number | null | undefined, businessId: number | null | undefined) =>
      ['admin', 'entry-volume', drawId ?? null, businessId ?? null] as const,
    locations:       (businessId: number | null | undefined, search: string, page: number, limit: number) =>
      ['admin', 'locations', businessId ?? null, search, page, limit] as const,
    userDetail:      (userId: number | null)    => ['admin', 'user-detail',      userId]             as const,
    businessDetail:  (id: number | null)        => ['admin', 'business-detail',  id]                 as const,
    businessEntries: (businessId: number | null, drawId: number | null, page: number) =>
      ['admin', 'business-entries', businessId, drawId, page] as const,
    // Prefix form (no args) for broad invalidation after an image decision.
    entriesAll: ['admin', 'entries'] as const,
    entries: (drawId: number | null, status: string, page: number) =>
      ['admin', 'entries', drawId, status, page] as const,
  },

  // --- Business (partner) --------------------------------------------------
  business: {
    all:       ['business']                      as const,
    myDetails: ['business', 'my-details']        as const,
    activity:  ['business', 'activity']          as const,
    stats: (locationId?: number | null, drawId?: number | null) =>
      ['business', 'stats', locationId ?? 'all', drawId ?? 'all'] as const,
  },

  // --- Draws (user-facing) -------------------------------------------------
  draws: {
    all:     ['draws']            as const,
    active:  ['draws', 'active']  as const,
    current: ['draws', 'current'] as const,
    history: ['draws', 'history'] as const,
    result:  (drawId: number) => ['draws', 'result', drawId] as const,
  },

  // --- Campaign (business dashboard) --------------------------------------
  campaign: {
    all:     ['campaign']          as const,
    list:    () => ['campaign', 'list'] as const,
    header:  (locationId?: number, campaignId?: number) =>
      ['campaign', 'header', locationId ?? 'all', campaignId ?? 'current'] as const,
    kpis:    (dateRange: unknown, locationId?: number, campaignId?: number) =>
      ['campaign', 'kpis', dateRange, locationId ?? 'all', campaignId ?? 'current'] as const,
    entries: (locationId?: number, campaignId?: number, range?: string) =>
      ['campaign', 'entries', locationId ?? 'all', campaignId ?? 'current', range ?? 'all-time'] as const,
  },

  // --- Subscription --------------------------------------------------------
  subscription: {
    all:      ['subscription']             as const,
    invoices: ['subscription', 'invoices'] as const,
  },

  // --- Tickets -------------------------------------------------------------
  tickets: {
    all:        ['tickets']                                    as const,
    mine:       (drawId?: number, locationId?: number) =>
      ['tickets', 'mine', drawId ?? 'all', locationId ?? 'all'] as const,
    freeStatus: ['tickets', 'free-status']                    as const,
    riskLevel:  ['tickets', 'risk-level']                     as const,
  },

  // --- Participating businesses (v2 entry) ---------------------------------
  participating: {
    all:    ['participating']                        as const,
    search: ['participating', 'locations', 'search'] as const,
  },

  // --- Nearby --------------------------------------------------------------
  nearby: {
    all:     ['nearby']            as const,
    receipt: ['nearby', 'receipt'] as const,
    search:  (q: string) => ['nearby', 'search', q] as const,
  },

  // --- Referral ------------------------------------------------------------
  referral: {
    link: ['referral', 'link']                        as const,
    code: (code: string | null) => ['referral', 'code', code] as const,
  },

  // --- Address autocomplete ------------------------------------------------
  address: {
    autocomplete: (q: string) => ['address', 'autocomplete', q] as const,
  },

  // --- Auth / region -------------------------------------------------------
  region: {
    check: ['region-check'] as const,
  },
} as const;
