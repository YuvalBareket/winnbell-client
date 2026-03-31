import {
  Paper, Box, Typography, Stack, IconButton, Divider, Button,
} from '@mui/material';
import { LocationOn, Edit, ChevronRight, Share, PersonRemove, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { BusinessLocation } from '../../types/business.types';

interface LocationCardProps {
  loc: BusinessLocation;
  onEdit: (loc: BusinessLocation) => void;
  onInvite: (locId: number) => void;
  onRemoveManager: (locId: number) => void;
  isInviting: boolean;
}

const LocationCard = ({
  loc,
  onEdit,
  onInvite,
  onRemoveManager,
  isInviting,
}: LocationCardProps) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
        <Box flex={1} minWidth={0}>
          <Typography variant='h6' fontWeight={700}>{loc.name}</Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
          >
            <LocationOn sx={{ fontSize: 16, flexShrink: 0 }} />
            {loc.address}
          </Typography>
        </Box>
        <Stack direction='row' alignItems='center' ml={1}>
          <IconButton sx={{ width: 44, height: 44 }} onClick={() => onEdit(loc)} aria-label='Edit location'>
            <Edit fontSize='small' />
          </IconButton>
          <IconButton sx={{ width: 44, height: 44 }} onClick={() => navigate('/scan')} aria-label='Generate tickets'>
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Manager section */}
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: loc.manager_id ? 'rgba(46,125,50,0.06)' : 'action.hover' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '50%',
              bgcolor: loc.manager_id ? 'success.main' : 'action.disabledBackground',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Person sx={{ fontSize: 18, color: loc.manager_id ? 'white' : 'text.disabled' }} />
            </Box>
            <Box>
              <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1 }}>
                Branch Manager
              </Typography>
              <Typography variant='body2' fontWeight={700} color={loc.manager_id ? 'text.primary' : 'text.disabled'}>
                {loc.manager_name || (loc.manager_id ? 'Manager Assigned' : 'No manager assigned')}
              </Typography>
            </Box>
          </Stack>
          {loc.manager_id ? (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<PersonRemove sx={{ fontSize: '14px !important' }} />}
              onClick={() => onRemoveManager(loc.id)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '0.75rem' }}
            >
              Remove
            </Button>
          ) : (
            <Button
              variant='outlined'
              size='small'
              startIcon={<Share />}
              disabled={isInviting}
              onClick={() => onInvite(loc.id)}
              sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 2 }}
            >
              {isInviting ? 'Generating...' : 'Invite Manager'}
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default LocationCard;
