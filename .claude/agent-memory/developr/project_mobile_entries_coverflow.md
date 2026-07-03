---
name: project_mobile_entries_coverflow
description: Mobile coverflow draw deck on My Entries page - active + closed campaigns swipeable
metadata:
  type: project
---

## Mobile Coverflow Deck on My Entries / Tickets Page

**Status**: Implemented 2026-07-03

**What was built**: Mobile-only coverflow swiper on the My Entries page (MyTicketsPage.tsx) that allows users to swipe through all campaigns (active + closed) and see their entries for each selected draw.

### Implementation Details

- **File modified**: `client/src/features/draw/components/DrawSwiper.tsx`
- **Files unchanged**: MyTicketsPage.tsx (desktop branch + mobile branch imports only), UpcomingDrawCard.tsx (card design preserved exactly)
- **Data source**: `useGetDrawHistory()` for mobile (includes closed campaigns), `useGetDraws()` for desktop
- **Card component**: Reuses `<UpcomingDrawCard />` (the existing card design, no modifications)
- **ActiveTicketsList**: Updates via `onDrawChange(draw.id)` callback when slide changes

### Design Decisions

**Direction: Vertical (not horizontal)**
- UpcomingDrawCard is a wide banner (full width with large prize text + decorative elements)
- Vertical scrolling allows the card to display at its proper width on mobile
- Horizontal would compress the card and waste space on the sides
- Mirrors DrawHistoryPage's mobile-vertical approach (established pattern in the codebase)

### Swiper Configuration (Mobile Only)

```
effect="coverflow"
coverflowEffect={{
  rotate: -17,
  stretch: [calculated from deck height],
  depth: 120,
  modifier: 1,
  slideShadows: false,
}}
direction="vertical"
centeredSlides
slidesPerView="auto"
loop={campaigns.length >= 3}
speed={420}
slideToClickedSlide
```

### CSS & Styling

- Flashlight shadow overlay on cards (::after pseudo-element gradient)
  - Active slide: no shadow (opacity 0)
  - Next slide: bottom gradient (to-bottom)
  - Prev slide: top gradient (to-top)
- Shadow tokens: `SHADOW_PRIMARY_GLOW`, `SHADOW_FLOAT`, `SHADOW_CARD`
- ResizeObserver on deck container for responsive `cardHeight` + `stretch` calculations
- `overflow: visible` on deck to allow peek + neighbors

### Campaign Ordering

Active campaigns listed first, then closed (same as DrawHistoryPage):
```
activeCampaigns = history.filter(d => d.status.toLowerCase() === 'open')
closedCampaigns = history.filter(d => d.status.toLowerCase() === 'closed')
allCampaigns = [...activeCampaigns, ...closedCampaigns]
```

### Default Selection

First slide (active campaign) is auto-selected on page load via existing `onDrawChange` callback.

### Edge Cases Handled

- Single campaign: deck renders (no loop)
- No campaigns: existing empty state (no campaigns returned from useGetDrawHistory)
- Loading: skeleton spinner
- Desktop: reverted to single card (no coverflow)
