// ─────────────────────────────────────────────
//  Winnbell Design Tokens - single source of truth
//  Change a value here → it propagates everywhere
// ─────────────────────────────────────────────

// ── Brand / Primary ──────────────────────────
export const PRIMARY_MAIN       = '#0292b7';   // main CTA, links, active states (Bondi Blue)
export const PRIMARY_LIGHT      = '#42bdba';   // gradient start, tints (Tropical Teal)
export const PRIMARY_DEEP       = '#1f628e';   // deep navy (success dialog gradient) (Baltic Blue)
export const PRIMARY_DARK       = '#1f628e';   // draw card gradient start (Baltic Blue)
export const PRIMARY_DARKER     = '#155a82';   // draw card gradient end (slightly darker Baltic)
export const BRAND_NAVY         = '#1f628e';   // hero gradient end (BusinessHub, Drawer) (Baltic Blue)

// ── Accent - warm gold for rewards/wins ──────
export const ACCENT_GOLD        = '#c5a047';   // warm amber-gold accent (Golden Bronze)
export const ACCENT_GOLD_LIGHT  = '#fdf5dc';   // gold tint background (warm tint of bronze)
export const ACCENT_GOLD_DARK   = '#a0822f';   // darker gold for contrast (darker bronze)

// ── Backgrounds ──────────────────────────────
export const BG_PAGE            = '#ffffff';   // auth pages, legal pages, hub page (Floral White)
export const BG_DEFAULT         = '#ffffff';   // MUI background.default (Floral White)
export const BG_APP_GRADIENT    = `linear-gradient(160deg, #e6f7f7 0%, #ffffff 40%, #f7f4e8 100%)`;
export const BG_SURFACE         = '#FFFFFF';   // card surfaces
export const BG_SUBTLE          = '#f5f0e0';   // subtle section backgrounds (warmer subtle)

// ── Text ─────────────────────────────────────
export const TEXT_PRIMARY       = '#111111';   // near black, warm
export const TEXT_SECONDARY     = '#5a6a7a';   // slightly warmer slate
export const TEXT_HEADING       = '#1a2e3b';   // page headings (Register, etc.) (dark with slight teal cast)
export const TEXT_ICON_MUTED    = '#7e8c8c';   // AppHeader icon (muted teal-grey)
export const TEXT_TERTIARY      = '#8fa0a0';   // de-emphasized labels (warmer tertiary)

// ── Manager / Dark role accent ───────────────
export const ROLE_MANAGER_BG    = '#0F172A';   // location manager button / icon bg
export const ROLE_MANAGER_HOVER = '#1E293B';   // location manager hover

// ── Borders & Dividers ───────────────────────
export const BORDER_LIGHT       = '#dde8e8';   // social buttons, input borders (slight teal tint)
export const BORDER_OVERLAY     = 'rgba(0,0,0,0.1)';
export const BORDER_SUBTLE      = '#ede8d8';   // very light dividers (warm cream border)

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
export const VERIFIED_BLUE  = '#60a5fa';  // verified badge
export const GOOGLE_BLUE    = '#0292b7';  // Google brand color — only for Google sign-in button
export const SHADOW_GOOGLE  = '0 2px 8px rgba(66,133,244,0.3)'; // Google button hover shadow

// ── Gradients ────────────────────────────────
export const GRADIENT_PRIMARY     = `linear-gradient(135deg, #42bdba 0%, #0292b7 100%)`;
export const GRADIENT_HERO        = `linear-gradient(135deg, #42bdba 0%, #1f628e 100%)`;
export const GRADIENT_DRAW_CARD   = `linear-gradient(135deg, #0292b7 0%, #1f628e 100%)`;
export const GRADIENT_SUCCESS     = `linear-gradient(160deg, #1f628e 0%, #0292b7 60%, #42bdba 100%)`;
export const GRADIENT_SIDEBAR     = `linear-gradient(195deg, #f8fafa 0%, #ffffff 100%)`;
export const GRADIENT_HERO_WARM   = `linear-gradient(135deg, #0292b7 0%, #1f628e 60%, #0f3d5c 100%)`;
export const GRADIENT_GOLD_CTA    = `linear-gradient(135deg, #c5a047 0%, #a0822f 100%)`;

// ── Shadows ───────────────────────────────────
export const SHADOW_PRIMARY_INTENSE = `0 4px 16px rgba(2,146,183,0.4)`;
export const SHADOW_PRIMARY_MEDIUM  = `0 8px 20px rgba(2,146,183,0.3)`;
export const SHADOW_PRIMARY_SOFT    = `0 8px 16px rgba(2,146,183,0.2)`;
export const SHADOW_NEUTRAL_SOFT    = `0 2px 8px rgba(0,0,0,0.15)`;
// Layered shadows for premium depth
export const SHADOW_CARD           = `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)`;
export const SHADOW_CARD_HOVER     = `0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)`;
export const SHADOW_ELEVATED       = `0 4px 6px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.08)`;
export const SHADOW_FLOAT          = `0 8px 28px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.04)`;
export const SHADOW_PRIMARY_GLOW   = `0 4px 20px rgba(2,146,183,0.35), 0 0px 40px rgba(2,146,183,0.15)`;
export const SHADOW_BOTTOM_NAV     = `0 -2px 12px rgba(0,0,0,0.06), 0 -1px 4px rgba(0,0,0,0.03)`;

// ── Alpha / Overlay utilities ─────────────────
export const ALPHA_PRIMARY_10  = 'rgba(2,146,183,0.1)';
export const ALPHA_PRIMARY_20  = 'rgba(2,146,183,0.2)';
export const ALPHA_PRIMARY_04  = 'rgba(2,146,183,0.04)';
export const ALPHA_PRIMARY_06  = 'rgba(2,146,183,0.06)';
export const ALPHA_WHITE_10    = 'rgba(255,255,255,0.1)';
export const ALPHA_WHITE_15    = 'rgba(255,255,255,0.15)';
export const ALPHA_WHITE_20    = 'rgba(255,255,255,0.2)';
export const ALPHA_WHITE_30    = 'rgba(255,255,255,0.3)';
export const ALPHA_WHITE_70    = 'rgba(255,255,255,0.7)';
export const ALPHA_WHITE_80    = 'rgba(255,255,255,0.8)';
export const ALPHA_GREEN_10    = 'rgba(46,125,50,0.1)';
export const ALPHA_GREEN_06    = 'rgba(46,125,50,0.06)';
export const ALPHA_GREEN_15    = 'rgba(46,125,50,0.15)';

// ── Glassmorphism utilities ─────────────────
export const GLASS_BG          = 'rgba(255,255,255,0.72)';
export const GLASS_BORDER      = 'rgba(255,255,255,0.5)';
export const GLASS_BACKDROP    = 'blur(16px) saturate(180%)';

// ── Layout ────────────────────────────────────────────────────────────────────
export const APP_HEADER_HEIGHT           = 60;  // AppHeader Toolbar height (mobile, static)
export const BOTTOM_NAV_HEIGHT           = 76;  // BottomNavigation + safe area
// Use MOBILE_CONTENT_HEIGHT for pages that show the AppHeader (most pages)
export const MOBILE_CONTENT_HEIGHT       = 'calc(100dvh - 136px)'; // 60px header + 76px nav
// Use MOBILE_CONTENT_HEIGHT_NO_HEADER for pages that hide the AppHeader (NearbyPage, ActivityPage)
export const MOBILE_CONTENT_HEIGHT_NO_HEADER = 'calc(100dvh - 76px)';
