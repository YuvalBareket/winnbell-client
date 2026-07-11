// ─────────────────────────────────────────────
//  Winnbell Design Tokens - single source of truth
//  Change a value here → it propagates everywhere
// ─────────────────────────────────────────────

// ── Brand / Primary ──────────────────────────
export const PRIMARY_MAIN       = '#1565c0';   // main CTA, links, active states (Bondi Blue)
export const PRIMARY_LIGHT      = '#42a5f5';   // gradient start, tints (Tropical Teal)
export const PRIMARY_DEEP       = '#0f3a6b';   // deep navy (success dialog gradient) (Baltic Blue)
export const PRIMARY_DARK       = '#0f3a6b';   // draw card gradient start (Baltic Blue)
export const PRIMARY_DARKER     = '#0a2747';   // draw card gradient end (slightly darker Baltic)
export const BRAND_NAVY         = '#0f3a6b';   // hero gradient end (BusinessHub, Drawer) (Baltic Blue)
export const BRAND_ICON_BLUE    = '#195DE2';   // Winnbell icon blue (matches winnbell_icon_*.svg + flyer QR)

// ── Accent - warm gold for rewards/wins ──────
export const ACCENT_GOLD        = '#c5a047';   // warm amber-gold accent (Golden Bronze)
export const ACCENT_GOLD_LIGHT  = '#fdf5dc';   // gold tint background (warm tint of bronze)
export const ACCENT_GOLD_CREAM  = '#f4e6c4';   // deeper cream, gold gradient end (free-entry card)
export const ACCENT_GOLD_DARK   = '#a0822f';   // darker gold for contrast (darker bronze)

// ── Backgrounds ──────────────────────────────
export const BG_PAGE            = '#ffffff';   // auth pages, legal pages, hub page (Floral White)
export const BG_DEFAULT         = '#ffffff';   // MUI background.default (Floral White)
export const BG_SURFACE         = '#FFFFFF';   // card surfaces
export const BG_SUBTLE          = '#f1f5f9';   // subtle section backgrounds (warmer subtle)

// ── Text ─────────────────────────────────────
export const TEXT_PRIMARY       = '#0f172a';   // near black, warm
export const TEXT_SECONDARY     = '#475569';   // slightly warmer slate
export const TEXT_EMPHASIS      = '#334155';   // between primary and secondary (checklist body)
export const TEXT_HEADING       = '#0f2747';   // page headings (Register, etc.) (dark with slight teal cast)
export const TEXT_ICON_MUTED    = '#7e8c8c';   // AppHeader icon (muted teal-grey)
export const TEXT_TERTIARY      = '#94a3b8';   // de-emphasized labels (warmer tertiary)

// ── Manager / Dark role accent ───────────────
export const ROLE_MANAGER_BG    = '#0F172A';   // location manager button / icon bg
export const ROLE_MANAGER_HOVER = '#1E293B';   // location manager hover

// ── Borders & Dividers ───────────────────────
export const BORDER_LIGHT       = '#dbe4ef';   // social buttons, input borders (slight teal tint)
export const BORDER_OVERLAY     = 'rgba(0,0,0,0.1)';
export const BORDER_SUBTLE      = '#e7edf4';   // very light dividers (warm cream border)

// ── Status - Activated (green) ───────────────
export const STATUS_ACTIVATED_BG   = '#e8f5e9';
export const STATUS_ACTIVATED_TEXT = '#2e7d32';

// ── Status - Pending (amber) ─────────────────
export const STATUS_PENDING_BG     = '#fff3e0';
export const STATUS_PENDING_TEXT   = '#e65100';

// ── Neutral UI ───────────────────────────────
export const NEUTRAL_INACTIVE_BG   = '#e0e0e0'; // inactive nav FAB
export const NEUTRAL_INACTIVE_ICON = '#9e9e9e'; // inactive nav icon
export const NEUTRAL_SOCIAL_TEXT   = '#444';    // social login button text
export const TABLE_HEADER_BG       = '#f5f5f5';

// ── Special accents ──────────────────────────
export const GOLD_TROPHY    = '#fbbf24';  // trophy icon
export const AMBER_HOURGLASS= '#f59e0b';  // hourglass icon
export const GOLD_SOFT      = '#fcd34d';  // light gold (founding card gradient start)
export const GOLD_INK       = '#3a2606';  // dark brown text/icons on gold backgrounds
export const GOLD_TINT_IVORY= '#fffbf0';  // warm white tint (founding card inner bg)
export const GOLD_TINT_CREAM= '#fef6e0';  // deeper warm cream (founding card inner bg end)
export const SUCCESS_GREEN  = '#10b981';  // winner / success states

// ── Analytics / dashboards ───────────────────
// Semantic metric colors (good / caution / bad) and a categorical palette for charts &
// progress bars. Single source of truth so admin analytics never hardcodes hex again.
export const METRIC_GOOD        = '#2e7d32';  // healthy / up-is-good
export const METRIC_GOOD_TINT   = 'rgba(46,125,50,0.12)';
export const METRIC_WARN        = '#f57c00';  // caution
export const METRIC_WARN_TINT   = 'rgba(245,124,0,0.12)';
export const METRIC_BAD         = '#c62828';  // unhealthy / down-is-bad
export const METRIC_BAD_TINT    = 'rgba(198,40,40,0.12)';
export const METRIC_NEUTRAL     = TEXT_SECONDARY;
// Categorical series (entry sources, acquisition channels, activity bands). Distinct + on-brand.
export const CHART_BLUE         = PRIMARY_MAIN;
export const CHART_BLUE_TINT    = 'rgba(21,101,192,0.12)';
export const CHART_GREEN        = '#2e7d32';
export const CHART_GREEN_TINT   = 'rgba(46,125,50,0.12)';
export const CHART_ORANGE       = '#ef6c00';
export const CHART_ORANGE_TINT  = 'rgba(239,108,0,0.12)';
export const CHART_PURPLE       = '#7b1fa2';
export const CHART_PURPLE_TINT  = 'rgba(123,31,162,0.12)';
export const CHART_TEAL         = '#00838f';
export const CHART_TEAL_TINT    = 'rgba(0,131,143,0.12)';
export const CHART_GRID         = '#eef2f7';  // recharts CartesianGrid stroke
export const VERIFIED_BLUE  = '#60a5fa';  // verified badge
export const GOOGLE_BLUE    = '#1565c0';  // Google brand color — only for Google sign-in button
export const SHADOW_GOOGLE  = '0 2px 8px rgba(66,133,244,0.3)'; // Google button hover shadow

// ── Gradients ────────────────────────────────
export const GRADIENT_PRIMARY     = `linear-gradient(135deg, #42a5f5 0%, #1565c0 100%)`;
export const GRADIENT_HERO        = `linear-gradient(135deg, #42a5f5 0%, #0f3a6b 100%)`;
export const GRADIENT_DRAW_CARD   = `linear-gradient(135deg, #1565c0 0%, #0f3a6b 100%)`;
export const GRADIENT_SUCCESS     = `linear-gradient(160deg, #0f3a6b 0%, #1565c0 60%, #42a5f5 100%)`;
export const GRADIENT_SIDEBAR     = `linear-gradient(160deg, #42a5f5 0%, #1565c0 46%, #0f3a6b 100%)`;
export const GRADIENT_HERO_WARM   = `linear-gradient(135deg, #1565c0 0%, #0f3a6b 60%, #081f3a 100%)`;
export const GRADIENT_GOLD_CTA    = `linear-gradient(135deg, #c5a047 0%, #a0822f 100%)`;
export const GRADIENT_GOLD_VIVID  = `linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)`;  // bright real-gold CTA (trophy gold to amber)
export const GRADIENT_FREE_CARD   = `linear-gradient(155deg, #eaf3fd 0%, #d6e6fb 100%)`;  // free-weekly-entry card (blue tint)
export const GRADIENT_LOADING     = `linear-gradient(150deg, #3a86de 0%, #1a68c2 52%, #134d8a 100%)`;
export const GRADIENT_GOLD_PRIZE  = `linear-gradient(90deg, #c5a047, #a0822f)`; // gold text for the campaign prize amount
export const GRADIENT_PROGRESS_BAR = `linear-gradient(90deg, #42a5f5, #1565c0)`; // entry-capacity progress bar fill
// Positive "you're filling up" green - used as entries approach / reach the draw max.
// Maxing out is a good thing, so it reads celebratory (emerald to forest), never a warning.
export const GRADIENT_SUCCESS_GREEN = `linear-gradient(135deg, #34d399 0%, #10b981 55%, #2e7d32 100%)`;
// Marketing "Ready to share" social post backgrounds (business-facing downloads).
export const GRADIENT_POST_NAVY    = `linear-gradient(150deg, #0f3a6b 0%, #0a2747 100%)`;
export const GRADIENT_POST_LIGHT   = `linear-gradient(160deg, #f4f8ff 0%, #e6eefb 100%)`;
export const GRADIENT_POST_ORANGE  = `linear-gradient(150deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)`;
export const GRADIENT_POST_PURPLE  = `linear-gradient(150deg, #7c3aed 0%, #5b21b6 55%, #4c1d95 100%)`;

// ── Shadows ───────────────────────────────────
export const SHADOW_PRIMARY_INTENSE = `0 4px 16px rgba(21,101,192,0.4)`;
export const SHADOW_PRIMARY_MEDIUM  = `0 8px 20px rgba(21,101,192,0.3)`;
export const SHADOW_PRIMARY_SOFT    = `0 8px 16px rgba(21,101,192,0.2)`;
export const SHADOW_NEUTRAL_SOFT    = `0 2px 8px rgba(0,0,0,0.15)`;
// Layered shadows for premium depth
export const SHADOW_CARD           = `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)`;
export const SHADOW_CARD_HOVER     = `0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)`;
export const SHADOW_ELEVATED       = `0 4px 6px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.08)`;
export const SHADOW_FLOAT          = `0 8px 28px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.04)`;
// Deep, glossy shadow - dark layered drop for a shiny, premium "lifted card" feel
export const SHADOW_CARD_DEEP      = `0 18px 40px rgba(0,0,0,0.34), 0 8px 16px rgba(0,0,0,0.24), 0 2px 4px rgba(0,0,0,0.18)`;
export const SHADOW_PRIMARY_GLOW   = `0 4px 20px rgba(21,101,192,0.35), 0 0px 40px rgba(21,101,192,0.15)`;
export const SHADOW_BOTTOM_NAV     = `0 -2px 12px rgba(0,0,0,0.06), 0 -1px 4px rgba(0,0,0,0.03)`;
// Warm glow behind the gold prize amount on the live campaign card.
export const SHADOW_GOLD_GLOW      = `0 0 18px rgba(251,191,36,0.55), 0 1px 2px rgba(0,0,0,0.25)`;

// ── Alpha / Overlay utilities ─────────────────
export const ALPHA_BLACK_04    = 'rgba(0,0,0,0.04)';
export const ALPHA_BLACK_06    = 'rgba(0,0,0,0.06)';
export const ALPHA_SUCCESS_04  = 'rgba(16,185,129,0.04)';
export const ALPHA_SUCCESS_08  = 'rgba(16,185,129,0.08)';
export const ALPHA_SUCCESS_12  = 'rgba(16,185,129,0.12)';
export const ALPHA_SUCCESS_25  = 'rgba(16,185,129,0.25)';
export const ALPHA_AMBER_04    = 'rgba(245,158,11,0.04)';
export const ALPHA_AMBER_08    = 'rgba(245,158,11,0.08)';
export const ALPHA_AMBER_12    = 'rgba(245,158,11,0.12)';
export const ALPHA_AMBER_25    = 'rgba(245,158,11,0.25)';
export const ALPHA_PRIMARY_10  = 'rgba(21,101,192,0.1)';
export const ALPHA_PRIMARY_20  = 'rgba(21,101,192,0.2)';
export const ALPHA_PRIMARY_25  = 'rgba(21,101,192,0.25)';
export const ALPHA_PRIMARY_40  = 'rgba(21,101,192,0.4)';
export const ALPHA_PRIMARY_04  = 'rgba(21,101,192,0.04)';
export const ALPHA_PRIMARY_06  = 'rgba(21,101,192,0.06)';
export const ALPHA_WHITE_10    = 'rgba(255,255,255,0.1)';
export const ALPHA_WHITE_15    = 'rgba(255,255,255,0.15)';
export const ALPHA_WHITE_20    = 'rgba(255,255,255,0.2)';
export const ALPHA_WHITE_30    = 'rgba(255,255,255,0.3)';
export const ALPHA_WHITE_50    = 'rgba(255,255,255,0.5)';
export const ALPHA_WHITE_70    = 'rgba(255,255,255,0.7)';
export const ALPHA_WHITE_80    = 'rgba(255,255,255,0.8)';
export const ALPHA_WHITE_85    = 'rgba(255,255,255,0.85)';
export const ALPHA_WHITE_90    = 'rgba(255,255,255,0.9)';
export const ALPHA_GREEN_10    = 'rgba(46,125,50,0.1)';
export const ALPHA_GREEN_06    = 'rgba(46,125,50,0.06)';
export const ALPHA_GREEN_15    = 'rgba(46,125,50,0.15)';
export const ALPHA_ORANGE_12   = 'rgba(245,124,0,0.12)'; // customers KPI icon tint

// Campaign dashboard entry-feed tints (light badge borders + avatar background)
export const AVATAR_BLUE_BG    = '#e3eefc'; // entry avatar circle background
export const BORDER_RECEIPT    = '#cfe0f7'; // Receipt source pill border (light blue)
export const BORDER_APPROVED   = '#b6e0b9'; // Approved / Free pill border (light green)
export const BORDER_REVIEW     = '#f5c99a'; // Under review pill border (light orange)
export const BORDER_PROMO      = '#e6d09a'; // Promo source pill border (light gold)

// ── Glassmorphism utilities ─────────────────
export const GLASS_BG          = 'rgba(255,255,255,0.72)';
export const GLASS_BORDER      = 'rgba(255,255,255,0.5)';
export const GLASS_BACKDROP    = 'blur(16px) saturate(180%)';

// ── Layout ────────────────────────────────────────────────────────────────────
export const APP_HEADER_HEIGHT           = 60;  // AppHeader Toolbar height (mobile, static)
export const BOTTOM_NAV_HEIGHT           = 76;  // BottomNavigation + safe area
// Viewport minus the bottom nav. Since the app-shell refactor every page renders its own
// AppPageHero inside the content flow, so no external header is subtracted anymore.
export const MOBILE_CONTENT_HEIGHT       = 'calc(var(--dvh100, 100dvh) - 76px)';
