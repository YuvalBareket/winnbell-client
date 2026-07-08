import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Typography, Stack, Paper, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import {
  PRIMARY_MAIN, GRADIENT_DRAW_CARD, GRADIENT_SUCCESS_GREEN,
  GRADIENT_POST_NAVY, GRADIENT_POST_LIGHT, GRADIENT_POST_ORANGE,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_80,
  TEXT_HEADING, TEXT_SECONDARY,
} from '../../../shared/colors';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { downloadNodeAsPng } from '../utils/capture';

// ── Master canvases (captured at scale 2 → 1080px wide social images) ─────────
// Feed posts are 4:5 portrait (1080x1350) - Instagram's preferred feed ratio, and it
// takes noticeably more screen than 1:1; Facebook renders it natively too.
const FEED_W = 540;
const FEED_H = 675;               // 4:5
const STORY_W = 440;              // 9:16 for Stories
const STORY_H = 780;

interface CardProps { businessName: string; locationLabel: string; scanUrl: string; prizeLabel?: string | null }

// Plain QR in a white panel (no brand icon overlay - cleaner at social sizes).
const QrPanel = ({ scanUrl, size, dark = TEXT_HEADING }: { scanUrl: string; size: number; dark?: string }) => (
  <Box sx={{ boxSizing: 'border-box', bgcolor: '#fff', borderRadius: '16px', p: '12px', flexShrink: 0, display: 'flex' }}>
    <QRCode value={scanUrl} size={size} level='H' fgColor={dark} />
  </Box>
);

const FinePrint = ({ light = true }: { light?: boolean }) => (
  <Typography sx={{ color: light ? ALPHA_WHITE_80 : TEXT_SECONDARY, fontSize: 12 }}>No purchase necessary</Typography>
);

// 1. Square: "Scan. Play. Win."
const SquareShareCard = ({ businessName, locationLabel, scanUrl }: CardProps) => (
  <Box sx={{ boxSizing: 'border-box', width: FEED_W, height: FEED_H, background: GRADIENT_DRAW_CARD, color: '#fff', p: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: -110, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)' }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 30 }} />
      <Typography sx={{ color: GOLD_TROPHY, fontWeight: 800, fontSize: 15, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        Free to enter
      </Typography>
    </Box>
    <Box>
      {['Scan.', 'Play.', 'Win.'].map((w) => (
        <Typography key={w} sx={{ fontWeight: 900, fontSize: 74, lineHeight: 1.04, letterSpacing: '-0.02em' }}>{w}</Typography>
      ))}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 22 }}>{businessName}</Typography>
        <Typography noWrap sx={{ color: ALPHA_WHITE_80, fontWeight: 600, fontSize: 15, mt: 0.5 }}>{locationLabel}</Typography>
        <Box sx={{ mt: 1.5 }}><FinePrint /></Box>
      </Box>
      <QrPanel scanUrl={scanUrl} size={104} />
    </Box>
  </Box>
);

// 2. Story: "Your first entry is on us."
const StoryShareCard = ({ businessName, scanUrl }: CardProps) => (
  <Box sx={{ boxSizing: 'border-box', width: STORY_W, height: STORY_H, background: GRADIENT_SUCCESS_GREEN, color: '#fff', p: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', bottom: -140, left: -100, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)' }} />
    <Box>
      <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 26, display: 'block', mb: 3 }} />
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: ALPHA_WHITE_15, borderRadius: '999px', px: 1.75, py: 0.75 }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: GOLD_TROPHY }} />
        <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: ACCENT_GOLD_LIGHT }}>
          Shop local. Free to enter.
        </Typography>
      </Box>
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: 50, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
        Scan to join this month's draw.
      </Typography>
      <Typography sx={{ color: ALPHA_WHITE_80, fontWeight: 600, fontSize: 19, mt: 2.5 }}>
        Scan in-store at {businessName}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
      <FinePrint />
      <QrPanel scanUrl={scanUrl} size={96} />
    </Box>
  </Box>
);

// 3. Prize post: "This month's grand draw $X"
const PrizeShareCard = ({ businessName, scanUrl, prizeLabel }: CardProps) => (
  <Box sx={{ boxSizing: 'border-box', width: FEED_W, height: FEED_H, background: GRADIENT_POST_NAVY, color: '#fff', p: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: -120, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD_TROPHY}2e 0%, ${GOLD_TROPHY}10 45%, transparent 70%)` }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 28 }} />
      <Typography sx={{ color: ALPHA_WHITE_80, fontWeight: 700, fontSize: 14 }}>{businessName}</Typography>
    </Box>
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{ color: ACCENT_GOLD_LIGHT, fontWeight: 800, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        This month's grand draw
      </Typography>
      <Typography sx={{ color: GOLD_TROPHY, fontWeight: 900, fontSize: 78, lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 4px 24px rgba(251,191,36,0.35)' }}>
        {prizeLabel}
      </Typography>
      <Typography sx={{ color: ALPHA_WHITE_80, fontWeight: 700, fontSize: 17, mt: 1 }}>Drawn at month's end. One winner.</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 18 }}>Scan to join the draw</Typography>
        <Box sx={{ mt: 1 }}><FinePrint /></Box>
      </Box>
      <QrPanel scanUrl={scanUrl} size={96} />
    </Box>
  </Box>
);

// 4. Announcement: "We're on Winnbell." (light card)
const AnnounceShareCard = ({ businessName, locationLabel, scanUrl }: CardProps) => (
  <Box sx={{ boxSizing: 'border-box', width: FEED_W, height: FEED_H, background: GRADIENT_POST_LIGHT, color: TEXT_HEADING, p: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', bottom: -130, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${PRIMARY_MAIN}14 0%, ${PRIMARY_MAIN}08 45%, transparent 70%)` }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box component='img' src='/winnbell_app_name.svg' sx={{ height: 28 }} />
      <Typography sx={{ bgcolor: `${PRIMARY_MAIN}14`, border: `1.5px solid ${PRIMARY_MAIN}`, borderRadius: '999px', px: 1.75, py: 0.5, color: PRIMARY_MAIN, fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Now live in-store
      </Typography>
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 900, fontSize: 58, lineHeight: 1.05, letterSpacing: '-0.02em', color: PRIMARY_MAIN }}>
        We're on Winnbell.
      </Typography>
      <Typography sx={{ color: TEXT_SECONDARY, fontWeight: 700, fontSize: 18, mt: 1.5 }}>
        Scan in-store to join the monthly prize draw.
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 22 }}>{businessName}</Typography>
        <Typography noWrap sx={{ color: TEXT_SECONDARY, fontWeight: 600, fontSize: 15, mt: 0.5 }}>{locationLabel}</Typography>
        <Box sx={{ mt: 1.5 }}><FinePrint light={false} /></Box>
      </Box>
      <QrPanel scanUrl={scanUrl} size={96} />
    </Box>
  </Box>
);

// 5. Reminder: "Don't leave without scanning your receipt."
const ReminderShareCard = ({ businessName, scanUrl }: CardProps) => (
  <Box sx={{ boxSizing: 'border-box', width: FEED_W, height: FEED_H, background: GRADIENT_POST_ORANGE, color: '#fff', p: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: -120, left: -90, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 45%, transparent 70%)' }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 28 }} />
      <Typography sx={{ bgcolor: ALPHA_WHITE_15, borderRadius: '999px', px: 1.75, py: 0.5, fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Every visit counts
      </Typography>
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: 54, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
      Don't leave without scanning your receipt.
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 22 }}>{businessName}</Typography>
        <Typography sx={{ color: ALPHA_WHITE_80, fontWeight: 700, fontSize: 16, mt: 0.5 }}>Takes seconds at the counter.</Typography>
        <Box sx={{ mt: 1.5 }}><FinePrint /></Box>
      </Box>
      <QrPanel scanUrl={scanUrl} size={96} />
    </Box>
  </Box>
);

// ── One gallery tile: fixed height, width follows the design's aspect ratio ────
// Every tile is the same height (rowH), so the row sits on an even baseline; the
// width is just rowH * (w/h), so a 9:16 Story is naturally narrower than a 4:5 card.
interface Post { id: string; label: string; w: number; h: number; node: ReactNode }

const GalleryTile = ({ post, rowH, disabled, isSaving, onSave }: {
  post: Post; rowH: number; disabled: boolean; isSaving: boolean; onSave: () => void;
}) => {
  const scale = rowH / post.h;
  const cardW = post.w * scale;

  return (
    <Box sx={{ width: cardW }}>
      <Box
        sx={{
          width: cardW,
          height: rowH,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,0.22)' },
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: post.w, height: post.h, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          {post.node}
        </Box>
      </Box>
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mt: 1.25 }}>
        <Typography noWrap sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', mr: 1 }}>{post.label}</Typography>
        {/* Slim text-style save chip - the preview is the star, not the button */}
        <Button
          size='small'
          disabled={disabled}
          onClick={onSave}
          startIcon={isSaving
            ? <CircularProgress size={12} color='inherit' />
            : <FileDownload sx={{ fontSize: '14px !important' }} />}
          sx={{
            textTransform: 'none', fontWeight: 700, fontSize: '0.72rem',
            color: PRIMARY_MAIN, minWidth: 0, px: 1, py: 0.25, borderRadius: '8px', flexShrink: 0,
            '& .MuiButton-startIcon': { mr: 0.5 },
            '&:hover': { bgcolor: `${PRIMARY_MAIN}0d` },
          }}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );
};

// ── Section: gallery of post previews + save buttons ──────────────────────────
interface ReadyToShareProps extends CardProps {
  canDownload: boolean;
  onRequireLocation: () => void;
  onToast: (msg: string) => void;
}

export const ReadyToShare = ({ businessName, locationLabel, scanUrl, prizeLabel, canDownload, onRequireLocation, onToast }: ReadyToShareProps) => {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upLg = useMediaQuery(theme.breakpoints.up('lg'));
  // Every post renders at this height; width follows each design's ratio. Sized so ~2 slides
  // show on mobile and ~3-4 on desktop within the swiper.
  const rowH = upLg ? 340 : upMd ? 300 : upSm ? 260 : 190;
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const props: CardProps = { businessName, locationLabel, scanUrl, prizeLabel };

  const posts = [
    { id: 'square', label: 'Instagram / Facebook · 4:5', w: FEED_W, h: FEED_H, node: <SquareShareCard {...props} /> },
    { id: 'story', label: 'Story · 9:16', w: STORY_W, h: STORY_H, node: <StoryShareCard {...props} /> },
    // Prize post only exists while there is a live draw with a prize to show.
    ...(prizeLabel ? [{ id: 'prize', label: 'Prize post · 4:5', w: FEED_W, h: FEED_H, node: <PrizeShareCard {...props} /> }] : []),
    { id: 'announce', label: 'Announcement · 4:5', w: FEED_W, h: FEED_H, node: <AnnounceShareCard {...props} /> },
    { id: 'reminder', label: 'Reminder · 4:5', w: FEED_W, h: FEED_H, node: <ReminderShareCard {...props} /> },
  ];

  const save = async (id: string) => {
    if (!canDownload) { onRequireLocation(); return; }
    setSaving(id);
    try {
      const node = refs.current[id];
      if (node) await downloadNodeAsPng(node, `winnbell-post-${id}.png`, 2);
      onToast('Image downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 }, overflow: 'hidden' }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant='h6' fontWeight={800} gutterBottom>Ready to share</Typography>
          <Typography variant='body2' color='text.secondary'>
            Post straight to Instagram, Facebook, or your Story. No design needed.
          </Typography>
        </Box>

        {/* Gallery swiper - every post at one fixed height, width by ratio; ~2 slides on
            mobile and ~3-4 on desktop, free-scroll with momentum and pagination dots. */}
        <Box
          sx={{
            '& .swiper': { overflow: 'visible', pb: 4.5 },
            '& .swiper-slide': { width: 'auto', height: 'auto' },
            '& .swiper-pagination': { bottom: 0 },
            '& .swiper-pagination-bullet': { bgcolor: TEXT_SECONDARY, opacity: 0.35 },
            '& .swiper-pagination-bullet-active': { bgcolor: PRIMARY_MAIN, opacity: 1 },
          }}
        >
          <Swiper
            modules={[FreeMode, Pagination, Mousewheel]}
            slidesPerView='auto'
            spaceBetween={upMd ? 24 : 14}
            grabCursor
            freeMode={{ enabled: true, momentum: true, momentumBounce: false }}
            mousewheel={{ forceToAxis: true }}
            pagination={{ clickable: true }}
          >
            {posts.map((p) => (
              <SwiperSlide key={p.id}>
                <GalleryTile
                  post={p}
                  rowH={rowH}
                  disabled={saving !== null}
                  isSaving={saving === p.id}
                  onSave={() => save(p.id)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>

        {/* Off-screen full-size masters: each card keeps its true pixel size (no transform),
            so html2canvas captures it cleanly. The 0x0 overflow-hidden wrapper clips their
            combined height so these absolute nodes never extend the page's scroll area -
            otherwise this short tab gains a tall empty region and the card bg "ends early". */}
        <Box aria-hidden sx={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
          {posts.map((p) => (
            <Box key={p.id} ref={(el: HTMLDivElement | null) => { refs.current[p.id] = el; }} sx={{ width: p.w, height: p.h }}>
              {p.node}
            </Box>
          ))}
        </Box>

        {!canDownload && (
          <Typography variant='caption' sx={{ color: PRIMARY_MAIN, fontWeight: 700 }}>
            Choose a location above to personalize and download these.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
