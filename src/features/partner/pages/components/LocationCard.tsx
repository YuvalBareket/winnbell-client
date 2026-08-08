import {
  Paper, Box, Typography, Stack, IconButton, Divider, Button, Chip,
} from '@mui/material';
import { LocationOn, Edit, DeleteOutline, Share, PersonRemove, Person, Schedule } from '@mui/icons-material';
import type { BusinessLocation } from '../../types/business.types';
import { TEXT_TERTIARY_AA } from '../../../../shared/colors';

interface LocationCardProps {
  loc: BusinessLocation;
  onEdit: (loc: BusinessLocation) => void;
  onRemove?: (loc: BusinessLocation) => void;
  onInvite: (locId: number) => void;
  onRemoveManager: (locId: number) => void;
  isInviting: boolean;
  isRemoving: boolean;
  isLastLocation: boolean;
}

const LocationCard = ({
  loc,
  onEdit,
  onRemove,
  onInvite,
  onRemoveManager,
  isInviting,
  isRemoving,
  isLastLocation,
}: LocationCardProps) => {

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' gap={1.5}>
        <Box flex={1} minWidth={0}>
          <Stack direction='row' alignItems='center' spacing={1} flexWrap='wrap'>
            <Typography variant='h6' fontWeight={700}>{loc.name}</Typography>
            {loc.activate_at_open && (
              <Chip
                icon={<Schedule sx={{ fontSize: '14px !important' }} />}
                label='Starts next campaign'
                size='small'
                sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22, bgcolor: 'rgba(25,118,210,0.1)', color: 'primary.main' }}
              />
            )}
            {loc.deactivate_at_open && (
              <Chip
                icon={<Schedule sx={{ fontSize: '14px !important' }} />}
                label='Ends with this campaign'
                size='small'
                sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22, bgcolor: 'rgba(237,108,2,0.1)', color: 'warning.main' }}
              />
            )}
          </Stack>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={loc.address}
          >
            <LocationOn sx={{ fontSize: 16, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {loc.address}
            </span>
          </Typography>
        </Box>
        <Stack direction='row' alignItems='center' spacing={0.5} flexShrink={0}>
          <IconButton sx={{ width: 40, height: 40 }} onClick={() => onEdit(loc)} aria-label='Edit location'>
            <Edit fontSize='small' />
          </IconButton>
          {onRemove && (
            <IconButton
              sx={{ width: 40, height: 40, color: isLastLocation ? 'text.disabled' : 'error.main' }}
              onClick={() => onRemove(loc)}
              disabled={isRemoving || isLastLocation}
              title={isLastLocation ? 'You must keep at least one location' : 'Remove location'}
              aria-label='Remove location'
            >
              <DeleteOutline fontSize='small' />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Manager section */}
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: loc.manager_id ? 'rgba(46,125,50,0.06)' : 'action.hover' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent={{ xs: 'flex-start', sm: 'space-between' }} gap={{ xs: 1.5, sm: 1 }}>
          <Stack direction='row' alignItems='center' spacing={1} minWidth={0}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '50%',
              bgcolor: loc.manager_id ? 'success.main' : 'action.disabledBackground',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Person sx={{ fontSize: 18, color: loc.manager_id ? 'white' : 'text.disabled' }} />
            </Box>
            <Box minWidth={0}>
              <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1, display: 'block' }}>
                Branch Manager
              </Typography>
              <Typography variant='body2' fontWeight={700} color={loc.manager_id ? 'text.primary' : TEXT_TERTIARY_AA} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                alignSelf: { xs: 'flex-end', sm: 'center' }
              }}
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
              sx={{
                fontWeight: 800,
                textTransform: 'none',
                px: 2,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                alignSelf: { xs: 'flex-end', sm: 'center' }
              }}
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
