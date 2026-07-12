import { useRef, useMemo } from 'react';
import type { PointerEvent } from 'react';

const MOVE_THRESHOLD = 10; // px of finger movement still counted as a tap

/**
 * Returns handlers that make a tap fire reliably even inside scrollable containers.
 *
 * Browsers cancel the native `click` once the finger moves a few pixels (assuming a scroll),
 * which drops taps on chip strips, lists, and nav bars. We detect the tap on `pointerup`
 * with a small movement threshold (not cancelled by scroll), and keep `onClick` as a
 * keyboard/desktop fallback, deduped so a real tap never fires twice.
 *
 * Spread the result onto any MUI button-like component:
 *   <ListItemButton {...useTap(handleNav)} />
 */
export function useTap(onTap: () => void) {
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const handledByPointer = useRef(false);

  return useMemo(() => ({
    onPointerDown: (e: PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
      handledByPointer.current = false;
    },
    onPointerMove: (e: PointerEvent) => {
      if (!start.current) return;
      if (
        Math.abs(e.clientX - start.current.x) > MOVE_THRESHOLD ||
        Math.abs(e.clientY - start.current.y) > MOVE_THRESHOLD
      ) {
        moved.current = true;
      }
    },
    onPointerUp: () => {
      if (start.current && !moved.current) {
        handledByPointer.current = true;
        onTapRef.current();
      }
      start.current = null;
    },
    onClick: () => {
      if (handledByPointer.current) {
        handledByPointer.current = false;
        return;
      }
      onTapRef.current();
    },
  }), []);
}
