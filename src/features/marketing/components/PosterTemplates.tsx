import qrcode from 'qrcode-generator';
import { DESIGN_W, DESIGN_H, POSTER_W, POSTER_H, POSTER_SCALE, LEGAL_TEXT } from './posterConstants';
import type { PosterProps } from './posterConstants';
import confettiPng from '../assets/confetti/confetti.png';

// ─────────────────────────────────────────────────────────────────────────────
// Poster templates - based on the approved "winnbell-poster-colorways" design.
// Values are design-space pixels measured from the design's computed styles - do not
// round or "tidy" them. The canvas was widened from the approved 1414x2000 (A4) to
// 1545x2000 = US Letter (8.5x11). The headline and logo stay left-anchored; the QR column
// and the 3-step row are centered on the full Letter width; the top confetti sits in the
// right corner; and the legal disclosure is bottom-anchored so it reaches the end of the
// flyer with a print-safe margin.
// The canvas components lay out at full design size; the exported templates show them
// through a scale() wrapper (crisp text, zero fractional-px layout), and the download
// path captures the full-size canvas 1:1 for print.
// ─────────────────────────────────────────────────────────────────────────────

const SANS = '"Plus Jakarta Sans", system-ui, sans-serif';
const QR_NAVY = '#0F2747';

// Square QR modules on crisp edges - matches the design's QR rendering.
// Also used by the sticker templates.
export const SquareQR = ({ value, size }: { value: string; size: number }) => {
  const qr = qrcode(0, 'H');
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        rects.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={QR_NAVY} />);
      }
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering='crispEdges' style={{ display: 'block' }}>
      {rects}
    </svg>
  );
};

// Radial glow as inline SVG (html2canvas rasterizes SVG gradients reliably;
// CSS radial-gradients are hit-or-miss in capture).
const RadialGlow = ({ color, size, fade }: { color: string; size: number; fade: number }) => {
  const id = `rg-${color.replace(/[^a-zA-Z0-9]/g, '')}-${size}-${fade}`;
  return (
    <svg width={size} height={size} style={{ display: 'block' }} aria-hidden>
      <defs>
        <radialGradient id={id}>
          <stop offset='0%' stopColor={color} />
          <stop offset={`${fade}%`} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </svg>
  );
};

const PinIcon = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill={color} style={{ display: 'block', flexShrink: 0 }}>
    <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z' />
  </svg>
);

// ── Colorway definitions (measured values, one entry per design colorway) ────
interface Colorway {
  pageBg: string;
  headlineColor: string;      // prize headline + step labels' base text
  accentColor: string;        // "This Current Draw.", "Scan to get your entries"
  sublineColor: string;
  chipColor: string;          // location chip text + pin (NOT always the accent)
  stepCircleBg: string;
  stepNumColor: string;
  stepLabelColor: string;
  legalColor: string;
  legalRule: string;          // hairline above the legal paragraph
  glow1: { color: string; fade: number };          // top-right ambient circle
  glow2: { color: string; fade: number } | null;   // second circle (dark colorways only)
  qrGlow: { color: string; fade: number };
  qrRing: string;
  logoVariant: 'white' | 'navy';
  confetti2Opacity: number;
}

const COLORWAYS: Record<'blue' | 'navy' | 'cream' | 'light', Colorway> = {
  blue: {
    pageBg: 'linear-gradient(168deg, #0F3A6B 0%, #1565C0 46%, #0F3A6B 82%, #0A2748 100%)',
    headlineColor: '#FFFFFF',
    accentColor: '#FFC107',
    sublineColor: 'rgba(255,255,255,0.95)',
    chipColor: '#FFC107',
    stepCircleBg: '#FFC107',
    stepNumColor: '#0A2748',
    stepLabelColor: '#FFFFFF',
    legalColor: 'rgba(255,255,255,0.8)',
    legalRule: 'rgba(255,255,255,0.2)',
    glow1: { color: 'rgba(66,165,245,0.32)', fade: 66 },
    glow2: { color: 'rgba(10,32,62,0.55)', fade: 68 },
    qrGlow: { color: 'rgba(255,193,7,0.3)', fade: 70 },
    qrRing: 'rgba(255,193,7,0.75)',
    logoVariant: 'white',
    confetti2Opacity: 0.4,
  },
  navy: {
    pageBg: 'linear-gradient(168deg, #0F172A 0%, #0A2747 48%, #0F3A6B 82%, #0A2747 100%)',
    headlineColor: '#FFFFFF',
    accentColor: '#C5A047',
    sublineColor: 'rgba(255,255,255,0.95)',
    chipColor: '#C5A047',
    stepCircleBg: '#C5A047',
    stepNumColor: '#0F172A',
    stepLabelColor: '#FFFFFF',
    legalColor: 'rgba(255,255,255,0.8)',
    legalRule: 'rgba(255,255,255,0.2)',
    glow1: { color: 'rgba(197,160,71,0.22)', fade: 66 },
    glow2: { color: 'rgba(15,23,42,0.6)', fade: 68 },
    qrGlow: { color: 'rgba(197,160,71,0.32)', fade: 70 },
    qrRing: 'rgba(197,160,71,0.8)',
    logoVariant: 'white',
    confetti2Opacity: 0.4,
  },
  cream: {
    pageBg: 'linear-gradient(168deg, #FDF5DC 0%, #F8ECC9 55%, #F2E0B0 100%)',
    headlineColor: '#0F2747',
    accentColor: '#A0822F',
    sublineColor: '#475569',
    chipColor: '#0F2747',
    stepCircleBg: '#0F2747',
    stepNumColor: '#FDF5DC',
    stepLabelColor: '#0F2747',
    legalColor: 'rgba(15,39,71,0.72)',
    legalRule: 'rgba(15,39,71,0.18)',
    glow1: { color: 'rgba(197,160,71,0.2)', fade: 66 },
    glow2: null,
    qrGlow: { color: 'rgba(160,130,47,0.18)', fade: 70 },
    qrRing: 'rgba(160,130,47,0.6)',
    logoVariant: 'navy',
    confetti2Opacity: 0.32,
  },
  light: {
    pageBg: 'linear-gradient(168deg, #FFFFFF 0%, #EEF4FD 52%, #DCE9FA 100%)',
    headlineColor: '#0F2747',
    accentColor: '#1565C0',
    sublineColor: '#334F70',
    chipColor: '#1565C0',
    stepCircleBg: '#1565C0',
    stepNumColor: '#FFFFFF',
    stepLabelColor: '#0F2747',
    legalColor: 'rgba(15,39,71,0.72)',
    legalRule: 'rgba(15,39,71,0.18)',
    glow1: { color: 'rgba(21,101,192,0.14)', fade: 66 },
    glow2: null,
    qrGlow: { color: 'rgba(21,101,192,0.16)', fade: 70 },
    qrRing: 'rgba(21,101,192,0.5)',
    logoVariant: 'navy',
    confetti2Opacity: 0.35,
  },
};

// ── Full-size canvas (design pixels, no scaling inside) ──────────────────────
// Default width is DESIGN_W (1545 = US Letter). pageW=HALF_DESIGN_W (1294) re-flows the
// SAME composition for the 5.5x8.5 half sheet: text metrics scale by s (the headline
// column ratio), right-anchored art tracks the right edge, centered blocks re-center.
// At the Letter width every derived value reduces EXACTLY to the approved design
// measurements (s = 1), so the Letter output is pixel-identical to before.
const PosterCanvas = ({ businessName, scanUrl, minAmountLabel, prizeLabel, pageW, cw }: PosterProps & { cw: Colorway }) => {
  const logoSrc = cw.logoVariant === 'white' ? '/winnbell_app_name_white.svg' : '/winnbell_app_name.svg';
  // Same semantics as the previous posters: minAmountLabel is a formatted amount
  // ("$20") or null when the business has no threshold.
  const stepLabel1 = minAmountLabel ? `Spend ${minAmountLabel} or more` : 'Make a purchase';

  const W = pageW ?? DESIGN_W;
  // Headline column: the approved 1270 on Letter, shrinking with the page (72px margins).
  const headlineW = Math.min(1270, W - 144);
  const s = headlineW / 1270; // 1 on Letter; ~0.906 on the half sheet

  return (
    <div
      style={{
        width: W,
        height: DESIGN_H,
        position: 'relative',
        overflow: 'hidden',
        background: cw.pageBg,
        fontFamily: SANS,
        flexShrink: 0,
      }}
    >
      {/* Ambient glow circles (right-anchored: Letter offsets 474/514 = W - 1071/1031) */}
      <div style={{ position: 'absolute', left: W - 1071, top: -400, pointerEvents: 'none' }}>
        <RadialGlow color={cw.glow1.color} size={1240} fade={cw.glow1.fade} />
      </div>
      {cw.glow2 && (
        <div style={{ position: 'absolute', left: W - 1031, top: 1180, pointerEvents: 'none' }}>
          <RadialGlow color={cw.glow2.color} size={1200} fade={cw.glow2.fade} />
        </div>
      )}

      {/* Confetti - one shared asset for all colorways; top copy hugs the right corner
          (Letter left 771 = W - 774, i.e. flush with the right edge) */}
      <img
        src={confettiPng}
        alt=''
        aria-hidden
        style={{ position: 'absolute', left: W - 774, top: -30, width: 774, height: 820, pointerEvents: 'none' }}
      />
      <img
        src={confettiPng}
        alt=''
        aria-hidden
        style={{
          position: 'absolute', left: -330, top: 1270, width: 774, height: 820,
          opacity: cw.confetti2Opacity,
          transform: 'scaleX(-1) rotate(8deg)',
          pointerEvents: 'none',
        }}
      />

      {/* Logotype */}
      <img
        src={logoSrc}
        alt='Winnbell'
        style={{
          position: 'absolute', left: 52, top: 22, width: 360, height: 122,
          objectFit: 'contain', objectPosition: 'left center', display: 'block',
        }}
      />

      {/* Headline + subline */}
      <div style={{ position: 'absolute', left: 72, top: 236, width: headlineW }}>
        <div style={{ fontSize: 150 * s, fontWeight: 800, letterSpacing: -5.25 * s, lineHeight: `${159 * s}px`, color: cw.headlineColor }}>
          {prizeLabel ?? '$3,000'}
          <br />
          {/* Smaller than line one: at the design's 150px this line overflows the 1270px
              column and wraps. 110px keeps it on one line; tracking keeps the same
              -0.035em ratio as the design (150px : -5.25). */}
          <span style={{ color: cw.accentColor, fontSize: 110 * s, letterSpacing: -4.2 * s }}>This Current Draw.</span>
        </div>
        {/* Subline bumped from the design's 42px (user request 2026-08-17); tracking and
            line-height scaled by the same ratio. One line in the headline column. */}
        <div style={{ fontSize: 44 * s, fontWeight: 800, letterSpacing: -0.48 * s, lineHeight: `${64.8 * s}px`, color: cw.sublineColor, marginTop: 28 }}>
          {"Could today's purchase win you a big cash prize?"}
        </div>
      </div>

      {/* Center column: location chip, QR card, scan caption. Centered on the full canvas
          width so the QR sits in the middle of the poster at any page size. */}
      <div style={{ position: 'absolute', left: 0, top: 775, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Chip enlarged from the design's 26px per user request 2026-08-01 ("too small");
            marginBottom shrunk by the same height gain so the QR card stays at y=846. */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 25 }}>
          <PinIcon color={cw.chipColor} size={40 * s} />
          <span style={{ fontSize: 36 * s, fontWeight: 800, letterSpacing: 2.16 * s, textTransform: 'uppercase', color: cw.chipColor, whiteSpace: 'nowrap' }}>
            {businessName}
          </span>
        </div>

        <div style={{ position: 'relative', width: 616, height: 616 }}>
          {/* accent glow behind the card: 708px circle centered on the 616px card */}
          <div style={{ position: 'absolute', left: -46, top: -46, pointerEvents: 'none' }}>
            <RadialGlow color={cw.qrGlow.color} size={708} fade={cw.qrGlow.fade} />
          </div>
          {/* accent ring: 648px, radius 74 */}
          <div style={{ position: 'absolute', left: -16, top: -16, width: 648, height: 648, borderRadius: 74, border: `4px solid ${cw.qrRing}`, boxSizing: 'border-box' }} />
          {/* White card. NO drop shadow - deliberate deviation from the design
              (user request 2026-08-01): html2canvas renders large soft shadows with
              visible banding in the exported PDF. */}
          <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', borderRadius: 58 }} />
          {/* QR: 568px, inset 24 */}
          <div style={{ position: 'absolute', left: 24, top: 24, width: 568, height: 568 }}>
            <SquareQR value={scanUrl} size={568} />
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <span style={{ fontSize: 62 * s, fontWeight: 800, letterSpacing: -0.93 * s, color: cw.accentColor }}>
            Scan to get your entries
          </span>
        </div>
      </div>

      {/* Steps row centered on the canvas; width = headline column keeps the design's
          space-between rhythm between the three steps. */}
      <div style={{ position: 'absolute', left: Math.round((W - headlineW) / 2), top: 1660, width: headlineW, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {[
          { n: '1', label: stepLabel1 },
          { n: '2', label: 'Submit your receipt' },
          { n: '3', label: 'Enter the current drawing' },
        ].map((step) => (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 14 * s }}>
            <span
              style={{
                width: 52 * s, height: 52 * s, flexShrink: 0, borderRadius: '50%',
                background: cw.stepCircleBg, color: cw.stepNumColor,
                fontSize: 27 * s, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {step.n}
            </span>
            <span style={{ fontSize: 29 * s, fontWeight: 700, letterSpacing: -0.29 * s, lineHeight: `${36.25 * s}px`, color: cw.stepLabelColor, whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legal fine print with the design's hairline rule above (1px + 22px padding).
          Bottom-anchored (bottom: 72, matching the side margins) so the disclosure reaches
          the end of the flyer with a print-safe margin no matter how many lines it wraps.
          Full content width (W - 72 side margins x2) so the rule and text span the flyer. */}
      <div style={{ position: 'absolute', left: 72, bottom: 72, width: W - 144, borderTop: `1px solid ${cw.legalRule}`, paddingTop: 22, fontSize: 24.5, fontWeight: 400, letterSpacing: 0.343, lineHeight: '34px', color: cw.legalColor, boxSizing: 'border-box' }}>
        {LEGAL_TEXT}
      </div>
    </div>
  );
};

// ── Display wrapper: shows the full-size canvas at 320x453 via transform ─────
const ScaledPoster = (p: PosterProps & { cw: Colorway }) => (
  <div style={{ width: POSTER_W, height: POSTER_H, overflow: 'hidden', flexShrink: 0 }}>
    <div style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${POSTER_SCALE})`, transformOrigin: 'top left' }}>
      <PosterCanvas {...p} />
    </div>
  </div>
);

// ── Public templates (320x453 display size) ──────────────────────────────────
export const PosterBlue = (p: PosterProps) => <ScaledPoster {...p} cw={COLORWAYS.blue} />;
export const PosterNavy = (p: PosterProps) => <ScaledPoster {...p} cw={COLORWAYS.navy} />;
export const PosterCream = (p: PosterProps) => <ScaledPoster {...p} cw={COLORWAYS.cream} />;
export const PosterLight = (p: PosterProps) => <ScaledPoster {...p} cw={COLORWAYS.light} />;

// ── Full-resolution canvases (1414x2000) - used by the capture/download path ─
export const PosterBlueCanvas = (p: PosterProps) => <PosterCanvas {...p} cw={COLORWAYS.blue} />;
export const PosterNavyCanvas = (p: PosterProps) => <PosterCanvas {...p} cw={COLORWAYS.navy} />;
export const PosterCreamCanvas = (p: PosterProps) => <PosterCanvas {...p} cw={COLORWAYS.cream} />;
export const PosterLightCanvas = (p: PosterProps) => <PosterCanvas {...p} cw={COLORWAYS.light} />;

// Legacy aliases so any other import site still compiles
/** @deprecated Use PosterNavy */
export const PosterEmerald = PosterNavy;
/** @deprecated Use PosterLight */
export const PosterSunset = PosterLight;

// Shared wrapper kept for any external usage
export const PosterWrap = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
  <div
    style={{
      width: POSTER_W,
      height: POSTER_H,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: bg ?? 'white',
    }}
  >
    {children}
  </div>
);
