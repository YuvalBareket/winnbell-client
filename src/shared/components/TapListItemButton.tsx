import { ListItemButton, type ListItemButtonProps } from '@mui/material';
import { useTap } from '../hooks/useTap';

interface TapListItemButtonProps extends Omit<ListItemButtonProps, 'onClick'> {
  onTap: () => void;
}

/**
 * A ListItemButton whose tap fires reliably even inside a scrollable drawer/list.
 * See useTap for the why. Use `onTap` instead of `onClick`.
 */
const TapListItemButton = ({ onTap, ...rest }: TapListItemButtonProps) => (
  <ListItemButton {...rest} {...useTap(onTap)} />
);

export default TapListItemButton;
