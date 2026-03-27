import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';
import { TEXT_ICON_MUTED } from '../colors';

interface Props {
  onMenuOpen: () => void;
}

const AppHeader = ({ onMenuOpen }: Props) => {
  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant='h6'
          fontWeight={500}
          letterSpacing={0.5}
          sx={{ color: TEXT_ICON_MUTED }}
        >
          Winnbell
        </Typography>
        <IconButton edge='end' onClick={onMenuOpen}>
          <Menu />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
