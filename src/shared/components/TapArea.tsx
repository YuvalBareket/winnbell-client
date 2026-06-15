import { Box, type BoxProps } from '@mui/material';
import { useTap } from '../hooks/useTap';

interface TapAreaProps extends Omit<BoxProps, 'onClick'> {
  onTap: () => void;
}

/**
 * A clickable Box whose tap fires reliably even inside scrollable lists — the same fix as
 * TapButton, but for non-button clickable cards/rows. Also adds basic button a11y (role,
 * focusability, Enter/Space) which a bare `<Box onClick>` lacks.
 */
const TapArea = ({ onTap, ...rest }: TapAreaProps) => (
  <Box
    role="button"
    tabIndex={0}
    {...rest}
    {...useTap(onTap)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onTap();
      }
    }}
  />
);

export default TapArea;
