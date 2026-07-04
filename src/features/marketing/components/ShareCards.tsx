import { useRef, useState } from 'react';
import { Box, Typography, Stack, Paper, Button, CircularProgress } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import QRCode from 'react-qr-code';
import {
  PRIMARY_MAIN, GRADIENT_DRAW_CARD, GRADIENT_SUCCESS_GREEN,
  GRADIENT_POST_NAVY, GRADIENT_POST_LIGHT, GRADIENT_POST_ORANGE,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_80,
  TEXT_HEADING, TEXT_SECONDARY,
} from '../../../shared/colors';
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
        First entry free
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
        Your first entry is on us.
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

// ── Section: swiper of post previews + save buttons ───────────────────────────
interface ReadyToShareProps extends CardProps {
  canDownload: boolean;
  onRequireLocation: () => void;
  onToast: (msg: string) => void;
}

const PREVIEW_H = 300;

export const ReadyToShare = ({ businessName, locationLabel, scanUrl, prizeLabel, canDownload, onRequireLocation, onToast }: ReadyToShareProps) => {
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
      const targets = id === 'all' ? posts : posts.filter((p) => p.id === id);
      for (const t of targets) {
        const node = refs.current[t.id];
        if (node) await downloadNodeAsPng(node, `winnbell-post-${t.id}.png`, 2);
      }
      onToast(id === 'all' ? 'All images downloaded!' : 'Image downloaded!');
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
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between' spacing={2}>
          <Box>
            <Typography variant='h6' fontWeight={800} gutterBottom>Ready to share</Typography>
            <Typography variant='body2' color='text.secondary'>
              Post straight to Instagram, Facebook, or your Story. No design needed. Swipe for more.
            </Typography>
          </Box>
          <Button
            variant='outlined'
            size='small'
            startIcon={saving === 'all' ? <CircularProgress size={14} color='inherit' /> : <FileDownload sx={{ fontSize: 16 }} />}
            disabled={saving !== null}
            onClick={() => save('all')}
            sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Download all
          </Button>
        </Stack>

        {/* Post swiper - keeps the page short no matter how many designs we add */}
        <Box sx={{ '& .swiper': { overflow: 'visible' }, '& .swiper-slide': { width: 'auto' } }}>
          <Swiper slidesPerView='auto' spaceBetween={20} grabCursor>
            {posts.map((p) => {
              const scale = PREVIEW_H / p.h;
              return (
                <SwiperSlide key={p.id}>
                  <Box>
                    {/* Scaled preview (display only - captures use the off-screen masters) */}
                    <Box sx={{ width: p.w * scale, height: PREVIEW_H, position: 'relative', overflow: 'hidden', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}>
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: p.w, height: p.h, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                        {p.node}
                      </Box>
                    </Box>
                    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mt: 1, width: p.w * scale }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>{p.label}</Typography>
                      {/* Slim text-style save chip - the preview is the star, not the button */}
                      <Button
                        size='small'
                        disabled={saving !== null}
                        onClick={() => save(p.id)}
                        startIcon={saving === p.id
                          ? <CircularProgress size={12} color='inherit' />
                          : <FileDownload sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          textTransform: 'none', fontWeight: 700, fontSize: '0.72rem',
                          color: PRIMARY_MAIN, minWidth: 0, px: 1, py: 0.25, borderRadius: '8px',
                          '& .MuiButton-startIcon': { mr: 0.5 },
                          '&:hover': { bgcolor: `${PRIMARY_MAIN}0d` },
                        }}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Box>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Box>

        {/* Off-screen full-size masters: rendered UNTRANSFORMED and unclipped, so html2canvas
            captures them cleanly (its known transform/overflow crop bugs never apply). */}
        <Box aria-hidden sx={{ position: 'absolute', left: -99999, top: 0 }}>
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
