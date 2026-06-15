import { Button, type ButtonProps } from '@mui/material';
import { useTap } from '../hooks/useTap';

interface TapButtonProps extends Omit<ButtonProps, 'onClick'> {
  onTap: () => void;
}

/**
 * A Button whose tap fires reliably even inside scrollable containers (chip strips, lists).
 * See useTap for the why. Use `onTap` instead of `onClick`.
 */
const TapButton = ({ onTap, ...rest }: TapButtonProps) => <Button {...rest} {...useTap(onTap)} />;

export default TapButton;
