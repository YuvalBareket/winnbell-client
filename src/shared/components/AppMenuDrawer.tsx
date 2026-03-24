import {
  Drawer,
  Box,
  Typography,
  Avatar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { logout } from '../../store/slices/authSlice';
import { selectCurrentUser } from '../../store/selectors/authSelectors';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AppMenuDrawer = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 280 },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #7fa6ff 0%, #06347e 100%)',
            px: 3,
            pt: 5,
            pb: 3,
            color: 'white',
          }}
        >
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography fontWeight={700} noWrap>
                {user?.fullName}
              </Typography>
              <Typography
                variant='caption'
                sx={{ color: 'rgba(255,255,255,0.7)' }}
                noWrap
              >
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <List sx={{ flex: 1, px: 1, pt: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              color: 'error.main',
              '&:hover': { bgcolor: 'error.50' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <Logout fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Log out'
              primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default AppMenuDrawer;
