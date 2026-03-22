import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Storefront,
  LocationOn,
  Groups,
  Settings,
  Share,
  Verified,
  ChevronRight,
  Business,
  ReceiptLong,
} from '@mui/icons-material';
import { useBusinessData } from '../hooks/useBusinessData';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useInviteManager } from '../hooks/useInviteManager';

const BusinessHubPage = () => {
  const { data: business, isLoading, isError } = useBusinessData();
  const { mutateAsync: generateInvite, isPending: isInviting } =
    useInviteManager();
  const handleCopyInvite = async (locId: number) => {
    // 2. Call the real API instead of a fake link
    await generateInvite(locId, {
      onSuccess: () => {
        // 3. This is where you'd trigger a professional Toast/Snackbar
        alert('Invite link copied to clipboard! Send it to your manager.');
      },
    });
  };
  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    );

  if (isError || !business)
    return (
      <Container maxWidth='sm' sx={{ mt: 10 }}>
        <Typography color='error'>
          Failed to load business profile. Please check your connection.
        </Typography>
      </Container>
    );

  const sectorUI = BUSINESS_SECTORS[business.sector] || BUSINESS_SECTORS.Retail;

  return (
    <Box sx={{ bgcolor: '#F4F7FA', minHeight: '100vh', pb: 12 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7fa6ff 0%, #06347e 100%)',
          pt: 8,
          pb: 9,
          px: 3,
          color: 'white',
          borderRadius: '0 0 4px 4px',
        }}
      >
        <Container maxWidth='sm'>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
          >
            <Stack direction='row' alignItems='center' spacing={3}>
              <Avatar
                variant='square'
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'white',
                  color: '#0F172A',
                  fontWeight: 900,
                  borderRadius: 1,
                }}
              >
                {business.name[0]}
              </Avatar>
              <Box>
                <Typography
                  variant='h5'
                  fontWeight={800}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  {business.name}{' '}
                  <Verified sx={{ fontSize: 20, color: 'primary.main' }} />
                </Typography>
                <Stack direction='row' spacing={1} mt={1}>
                  <Chip
                    label={sectorUI.label}
                    size='small'
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: 1,
                    }}
                  />
                  <Chip
                    label='Active Partner'
                    size='small'
                    color='success'
                    sx={{ fontWeight: 700, borderRadius: 1 }}
                  />
                </Stack>
              </Box>
            </Stack>
            <IconButton
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 1,
              }}
            >
              <Settings />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='sm' sx={{ mt: -5 }}>
        <Stack spacing={3}>
          <Paper
            variant='outlined'
            sx={{
              p: 3,
              borderRadius: 1,
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <ReceiptLong color='primary' />
            <Box>
              <Typography
                variant='caption'
                fontWeight={800}
                color='text.secondary'
                sx={{ textTransform: 'uppercase' }}
              >
                Subscription Plan
              </Typography>
              <Typography variant='body1' fontWeight={700}>
                Standard Monthly Tier
              </Typography>
            </Box>
          </Paper>

          <Box>
            <Typography
              variant='subtitle2'
              fontWeight={800}
              sx={{
                mb: 2,
                ml: 1,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Branch Management
            </Typography>
            <Stack spacing={2}>
              {business.locations.map((loc: any) => (
                <Paper
                  key={loc.id}
                  variant='outlined'
                  sx={{ p: 2.5, borderRadius: 1, overflow: 'hidden' }}
                >
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='flex-start'
                  >
                    <Box>
                      <Typography variant='h6' fontWeight={700}>
                        {loc.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <LocationOn sx={{ fontSize: 16 }} /> {loc.address}
                      </Typography>
                    </Box>
                    <IconButton size='small'>
                      <ChevronRight />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Groups
                        sx={{
                          fontSize: 20,
                          color: loc.user_id ? 'success.main' : 'text.disabled',
                        }}
                      />
                      <Typography
                        variant='body2'
                        fontWeight={700}
                        color={loc.user_id ? 'text.primary' : 'text.disabled'}
                      >
                        {loc.manager_name ||
                          (loc.user_id ? 'Manager Assigned' : 'Unassigned')}
                      </Typography>
                    </Stack>
                    {loc?.user_id && (
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<Share />}
                        disabled={isInviting} // Disable while the link is generating
                        onClick={() => handleCopyInvite(loc.id)}
                        sx={{
                          borderRadius: 1,
                          fontWeight: 800,
                          textTransform: 'none',
                          px: 2,
                        }}
                      >
                        {isInviting ? 'Generating...' : 'Invite'}
                      </Button>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default BusinessHubPage;
