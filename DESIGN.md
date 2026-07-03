# Winnbell Design Context

Read this before designing or building any UI. It maps the design system so you compose Winnbell's real tokens and components instead of inventing new ones. Winnbell is a consumer rewards/sweepstakes PWA: warm, premium, trustworthy, playful in celebration moments.

**Stack:** React 19 + TypeScript, MUI v7 (`@mui/material`, `@mui/icons-material`), framer-motion, Swiper. Emotion styling via MUI `sx`. Feature-based structure under `src/features/<feature>/`; cross-cutting UI lives in `src/shared/`.

---

## 1. Tokens — never hardcode a hex value

Every color, gradient, shadow, and layout constant is a named export in `src/shared/colors.ts`. Import from there (or read the value from the MUI theme). Never paste a raw hex/rgba into a component.

**Brand / primary**
- `PRIMARY_MAIN` `#1565c0` — main CTA, links, active states
- `PRIMARY_LIGHT` `#42a5f5` — gradient starts, tints
- `PRIMARY_DEEP` / `PRIMARY_DARK` `#0f3a6b`, `PRIMARY_DARKER` `#0a2747`, `BRAND_NAVY` `#0f3a6b` — deep navies for gradients/heroes
- `BRAND_ICON_BLUE` `#195DE2` — the Winnbell icon blue (matches the SVG logos + QR)

**Accent — warm gold (rewards/wins)**
- `ACCENT_GOLD` `#c5a047`, `ACCENT_GOLD_LIGHT` `#fdf5dc`, `ACCENT_GOLD_DARK` `#a0822f`
- `GOLD_TROPHY` `#fbbf24`, `SUCCESS_GREEN` `#10b981` — win/success moments

**Surfaces & text**
- Backgrounds: `BG_PAGE` / `BG_DEFAULT` / `BG_SURFACE` white, `BG_SUBTLE` `#f1f5f9`, `BG_APP_GRADIENT` (fixed dark band fading to light — the app page backdrop)
- Text: `TEXT_PRIMARY` `#0f172a`, `TEXT_SECONDARY` `#475569`, `TEXT_HEADING` `#0f2747`, `TEXT_TERTIARY` `#94a3b8`
- Borders: `BORDER_LIGHT`, `BORDER_SUBTLE`, `BORDER_OVERLAY`

**Status**
- Activated (green): `STATUS_ACTIVATED_BG` / `STATUS_ACTIVATED_TEXT`
- Pending (amber): `STATUS_PENDING_BG` / `STATUS_PENDING_TEXT`

**Analytics (business/admin dashboards)** — semantic metric colors `METRIC_GOOD` / `METRIC_WARN` / `METRIC_BAD` (+ `_TINT`), categorical chart series `CHART_BLUE/GREEN/ORANGE/PURPLE/TEAL` (+ `_TINT`), `CHART_GRID`.

**Gradients** (use the presets, don't rebuild them): `GRADIENT_PRIMARY`, `GRADIENT_HERO`, `GRADIENT_HERO_WARM`, `GRADIENT_DRAW_CARD`, `GRADIENT_SUCCESS`, `GRADIENT_GOLD_CTA`, `GRADIENT_SIDEBAR`, `GRADIENT_LOADING`.

**Shadows** — layered presets for premium depth: `SHADOW_CARD`, `SHADOW_CARD_HOVER`, `SHADOW_ELEVATED`, `SHADOW_FLOAT`, `SHADOW_CARD_DEEP`, `SHADOW_PRIMARY_GLOW`, `SHADOW_BOTTOM_NAV`, plus `SHADOW_PRIMARY_*`.

**Alpha / glass utilities** — `ALPHA_*` overlays, and glassmorphism via `GLASS_BG` + `GLASS_BORDER` + `GLASS_BACKDROP`.

**Layout constants** — `APP_HEADER_HEIGHT` (60), `BOTTOM_NAV_HEIGHT` (76), `MOBILE_CONTENT_HEIGHT` (`calc(100dvh - 136px)`), `MOBILE_CONTENT_HEIGHT_NO_HEADER` (`calc(100dvh - 76px)`). Use these for full-height mobile pages.

---

## 2. Theme (`src/shared/theme.ts`)

- **Font:** `"Plus Jakarta Sans", "Manrope", "Roboto", sans-serif`.
- **Headings:** heavy and tight — h1/h2/h3 are weight 800 with negative letter-spacing; h4-h6 weight 700. Body copy has generous line-height (body1 ~1.65).
- **Buttons:** `textTransform: none`, weight 700, **pill-shaped** (`borderRadius: 32`), no default shadow, `padding: 10px 22px`.
- **Cards/Paper:** `borderRadius: 10`, `SHADOW_CARD` resting → `SHADOW_CARD_HOVER` on hover, subtle `BORDER_SUBTLE` border.
- **Inputs:** outlined inputs are pill-shaped (`borderRadius: 32`).
- **Base shape radius:** 8. Chips radius 8, weight 600.

Design to this theme. Prefer palette/theme references (`color: 'text.secondary'`, `color: 'primary.main'`) over raw tokens when a theme slot exists.

---

## 3. Motion (`src/shared/motion.ts`) — nothing pops onto screen

Animate all lazily-loaded/conditional content with framer-motion using these shared presets — don't invent one-off transitions.

- **Springs:** `SPRING_SNAPPY` (taps/small changes), `SPRING_POP` (entrances, slight overshoot), `SPRING_BOUNCY` (celebrations).
- **Entrance variants** (with `staggerContainer` parent): `popIn` (workhorse), `dropIn` (heroes/headers), `slideInLeft` / `slideInRight`, `heroPop` (prize numbers).
- **Gesture props** (spread onto `motion.*`): `pressable` (CTAs), `pressableCard` (cards/rows), `pressableIcon` (icon buttons).
- **Looping attractors** — **max ONE per page**, reserved for the single most important action: `breathe`, `wiggle`. Everything else is reactive, so pages never feel noisy.

Timing rule: tap feedback < 100ms; meaningful motion in the 200-500ms band.

---

## 4. Reusable components — compose these, don't re-create

Located in `src/shared/components/`. Use them before building a new equivalent.

- **`TapButton`** — MUI `Button` that fires reliably inside scrollable containers. Takes all `ButtonProps` but use **`onTap`** instead of `onClick`. (`TapListItemButton`, `TapArea` are the ListItemButton / generic-area equivalents.)
- **`EmptyState`** — centered empty state. Props: `icon` (ReactNode), `title`, optional `description`, optional `actionLabel` + `onAction`. Has a built-in dashed-ring icon halo.
- **`LoadingScreen`** — full-screen branded loader (gradient + logo + bouncing dots). Use for route/suspense fallbacks.
- **`AppHeader`**, **`AppSidebar`**, **`AppMenuDrawer`**, **`MainLayout`** — the app shell (mobile header + desktop sidebar + drawer). New pages render inside `MainLayout`.
- **`AccountSwitcher`** — Instagram-style device account switcher (max 2 accounts); menu on desktop, inline on mobile.
- **`RegionGate` / `AccessGate`** — gate content by region/access.
- **`AddressAutoComplete`** — address input with autocomplete.
- **`ErrorBoundary`** — wraps risky subtrees.

For icons use `@mui/icons-material`. For carousels use Swiper (already a dependency).

---

## 5. Copy & content rules (hard rules)

- **No em dashes** anywhere in UI text or string literals. Use a period or a hyphen.
- **Legal:** never use copy implying a purchase improves winning odds. "Spend more, win more" and any equivalent is banned. Entries/rewards language must not tie money to odds.
- **Business-facing analytics:** never expose risk/quarantine wording. Say **"under review"**, never "rejected". Use plain owner-friendly names (Customer = a person, Entry = a ticket).
- Keep tone warm, confident, and clear. Celebration screens can be playful; transactional screens stay calm.

---

## 6. Responsive & platform

- Mobile-first PWA. Design mobile and desktop; the shell switches between bottom-nav/header (mobile) and sidebar (desktop).
- Respect the map budgets if touching map UI: list renders every location, no marker clustering, payload stays small.
- Generous touch targets; buttons and inputs are pill-shaped by theme default.

---

**Golden rule:** if a color, gradient, shadow, motion preset, or shell component already exists in `shared/`, use it. New visual primitives should be added to `colors.ts` / `motion.ts`, not hardcoded inline.
