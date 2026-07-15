import { useRef, useState } from 'react';
import { ConfettiPop } from '../components/GoldConfetti';
import { makePopPieces, type PopPiece } from '../components/confettiPieces';

/**
 * Tap-to-celebrate for the congrats screens: every tap pops a radial confetti burst FROM
 * the tap point. Attach `fireBurst` as the celebration container's onClick and render
 * `{confettiBursts}` inside it (the container must be position: relative).
 *
 * Kept cheap on purpose: pieces are generated in the handler (never in render), at most
 * 4 bursts animate at once, and each burst removes itself from the DOM when its longest
 * fleck has finished - spamming taps can never accumulate nodes or cause lag.
 */
const MAX_BURSTS = 4;
// Slightly past the longest fleck's flight (makePopPieces caps duration at ~3.7s).
const BURST_LIFETIME_MS = 3900;

export const useConfettiTaps = () => {
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number; pieces: PopPiece[] }>>([]);
  const burstIdRef = useRef(0);

  const fireBurst = (e: React.MouseEvent) => {
    burstIdRef.current += 1;
    const id = burstIdRef.current;
    setBursts((prev) => [
      ...prev.slice(-(MAX_BURSTS - 1)),
      { id, x: e.clientX, y: e.clientY, pieces: makePopPieces() },
    ]);
    setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), BURST_LIFETIME_MS);
  };

  const confettiBursts = bursts.map((b) => (
    <ConfettiPop key={b.id} x={b.x} y={b.y} pieces={b.pieces} />
  ));

  return { fireBurst, confettiBursts };
};
