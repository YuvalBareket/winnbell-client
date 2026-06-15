import { useRef } from 'react';
import { Button, type ButtonProps } from '@mui/material';

const MOVE_THRESHOLD = 10; // px of finger movement still counted as a tap

interface TapButtonProps extends Omit<ButtonProps, 'onClick'> {
  onTap: () => void;
}

/**
 * A Button whose tap fires reliably even inside scrollable containers.
 *
 * Inside a scroller (e.g. a horizontal chip strip or a vertical list), the browser cancels
 * the native `click` as soon as the finger moves a few pixels — it assumes you meant to
 * scroll. The ripple/active animation already fired on touch-start, so it looks like the
 * button "did nothing." We instead detect the tap on `pointerup` with a small movement
 * threshold, which the browser does NOT cancel. `onClick` is kept as a keyboard/desktop
 * fallback and deduped so a real tap never fires twice.
 *
 * MUI's ButtonBase drives its ripple from mouse/touch events, not pointer events, so adding
 * pointer handlers here doesn't interfere with the ripple.
 */
const TapButton = ({ onTap, ...rest }: TapButtonProps) => {
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const handledByPointer = useRef(false);

  return (
    <Button
      {...rest}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
        moved.current = false;
        handledByPointer.current = false;
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        if (
          Math.abs(e.clientX - start.current.x) > MOVE_THRESHOLD ||
          Math.abs(e.clientY - start.current.y) > MOVE_THRESHOLD
        ) {
          moved.current = true;
        }
      }}
      onPointerUp={() => {
        if (start.current && !moved.current) {
          handledByPointer.current = true;
          onTap();
        }
        start.current = null;
      }}
      onClick={() => {
        // Skip the click that follows a pointer-handled tap (avoid double-firing); allow
        // keyboard/desktop clicks through.
        if (handledByPointer.current) {
          handledByPointer.current = false;
          return;
        }
        onTap();
      }}
    />
  );
};

export default TapButton;
