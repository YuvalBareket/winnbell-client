import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';

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
          sx={{ color: '#7e7e7e' }}
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
