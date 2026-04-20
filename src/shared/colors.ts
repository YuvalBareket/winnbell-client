// ─────────────────────────────────────────────
//  Winnbell Design Tokens — single source of truth
//  Change a value here → it propagates everywhere
// ─────────────────────────────────────────────

// ── Brand / Primary ──────────────────────────
export const PRIMARY_MAIN       = '#195de6';   // main CTA, links, active states
export const PRIMARY_LIGHT      = '#7fa6ff';   // gradient start, tints
export const PRIMARY_DEEP       = '#0f2d6b';   // deep navy (success dialog gradient)
export const PRIMARY_DARK       = '#0052CC';   // draw card gradient start
export const PRIMARY_DARKER     = '#0747A6';   // draw card gradient end
export const BRAND_NAVY         = '#06347e';   // hero gradient end (BusinessHub, Drawer)

// ── Accent — warm gold for rewards/wins ──────
export const ACCENT_GOLD        = '#F5A623';   // warm amber-gold accent
export const ACCENT_GOLD_LIGHT  = '#FFF4E0';   // gold tint background
export const ACCENT_GOLD_DARK   = '#D4871C';   // darker gold for contrast

// ── Backgrounds ──────────────────────────────
export const BG_PAGE            = '#F8FAFC';   // auth pages, legal pages, hub page
export const BG_DEFAULT         = '#f8f9fa';   // MUI background.default
export const BG_APP_GRADIENT    = `linear-gradient(160deg, #eef4ff 0%, #ffffff 40%, #f7f9fc 100%)`;
export const BG_SURFACE         = '#FFFFFF';   // card surfaces
export const BG_SUBTLE          = '#F1F5F9';   // subtle section backgrounds

// ── Text ─────────────────────────────────────
export const TEXT_PRIMARY       = '#0e121b';
export const TEXT_SECONDARY     = '#64748B';
export const TEXT_HEADING       = '#1E293B';   // page headings (Register, etc.)
export const TEXT_ICON_MUTED    = '#7e7e7e';   // AppHeader icon
export const TEXT_TERTIARY      = '#94A3B8';   // de-emphasized labels

// ── Manager / Dark role accent ───────────────
export const ROLE_MANAGER_BG    = '#0F172A';   // location manager button / icon bg
export const ROLE_MANAGER_HOVER = '#1E293B';   // location manager hover

// ── Borders & Dividers ───────────────────────
export const BORDER_LIGHT       = '#E2E8F0';   // social buttons, input borders
export const BORDER_OVERLAY     = 'rgba(0,0,0,0.1)';
export const BORDER_SUBTLE      = '#F1F5F9';   // very light dividers

// ── Status — Activated (green) ───────────────
export const STATUS_ACTIVATED_BG   = '#e8f5e9';
export const STATUS_ACTIVATED_TEXT = '#2e7d32';

// ── Status — Pending (amber) ─────────────────
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

// ── Gradients ────────────────────────────────
export const GRADIENT_PRIMARY     = `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)`;
export const GRADIENT_HERO        = `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${BRAND_NAVY} 100%)`;
export const GRADIENT_DRAW_CARD   = `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY_DARKER} 100%)`;
export const GRADIENT_SUCCESS     = `linear-gradient(160deg, ${PRIMARY_DEEP} 0%, ${PRIMARY_MAIN} 60%, ${PRIMARY_LIGHT} 100%)`;
export const GRADIENT_SIDEBAR     = `linear-gradient(195deg, #fafbff 0%, #ffffff 100%)`;
export const GRADIENT_HERO_WARM   = `linear-gradient(135deg, #1a4fd4 0%, #0a2f70 60%, #071e4a 100%)`;
export const GRADIENT_GOLD_CTA    = `linear-gradient(135deg, ${ACCENT_GOLD} 0%, ${ACCENT_GOLD_DARK} 100%)`;

// ── Shadows ───────────────────────────────────
export const SHADOW_PRIMARY_INTENSE = `0 4px 16px rgba(25,93,230,0.4)`;
export const SHADOW_PRIMARY_MEDIUM  = `0 8px 20px rgba(25,93,230,0.3)`;
export const SHADOW_PRIMARY_SOFT    = `0 8px 16px rgba(25,93,230,0.2)`;
export const SHADOW_NEUTRAL_SOFT    = `0 2px 8px rgba(0,0,0,0.15)`;
// Layered shadows for premium depth
export const SHADOW_CARD           = `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)`;
export const SHADOW_CARD_HOVER     = `0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)`;
export const SHADOW_ELEVATED       = `0 4px 6px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.08)`;
export const SHADOW_FLOAT          = `0 8px 28px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.04)`;
export const SHADOW_PRIMARY_GLOW   = `0 4px 20px rgba(25,93,230,0.35), 0 0px 40px rgba(25,93,230,0.15)`;
export const SHADOW_BOTTOM_NAV     = `0 -2px 12px rgba(0,0,0,0.06), 0 -1px 4px rgba(0,0,0,0.03)`;

// ── Alpha / Overlay utilities ─────────────────
export const ALPHA_PRIMARY_10  = 'rgba(25,93,230,0.1)';
export const ALPHA_PRIMARY_20  = 'rgba(25,93,230,0.2)';
export const ALPHA_PRIMARY_04  = 'rgba(25,93,230,0.04)';
export const ALPHA_PRIMARY_06  = 'rgba(25,93,230,0.06)';
export const ALPHA_WHITE_10    = 'rgba(255,255,255,0.1)';
export const ALPHA_WHITE_15    = 'rgba(255,255,255,0.15)';
export const ALPHA_WHITE_20    = 'rgba(255,255,255,0.2)';
export const ALPHA_WHITE_30    = 'rgba(255,255,255,0.3)';
export const ALPHA_WHITE_70    = 'rgba(255,255,255,0.7)';
export const ALPHA_WHITE_80    = 'rgba(255,255,255,0.8)';
export const ALPHA_GREEN_10    = 'rgba(46,125,50,0.1)';

// ── Glassmorphism utilities ─────────────────
export const GLASS_BG          = 'rgba(255,255,255,0.72)';
export const GLASS_BORDER      = 'rgba(255,255,255,0.5)';
export const GLASS_BACKDROP    = 'blur(16px) saturate(180%)';
