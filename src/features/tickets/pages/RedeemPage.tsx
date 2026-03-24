import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import {
  Bolt,
  QrCodeScanner,
  Edit,
  CardGiftcard,
  AddCircleOutline,
  Storefront,
  CheckCircle,
} from '@mui/icons-material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

import {
  selectIsBusiness,
  selectIsLocationManager,
} from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import { useRedeemTicket } from '../hooks/useTickets';
import { useGenerateTicket } from '../hooks/useGenerateTicket';
import { useBusinessData } from '../../partner/hooks/useBusinessData';

const RedeemPage = () => {
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isLocationManager = useAppSelector(selectIsLocationManager);
  const isBusiness = isBusinessAdmin || isLocationManager;
  const navigate = useNavigate();

  // State
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');

  const primaryColor = '#195de6';

  // Business owner locations
  const { data: businessData } = useBusinessData(isBusinessAdmin);
  const locations = isBusinessAdmin ? (businessData?.locations ?? []) : [];

  // Mutations
  const redeemMutation = useRedeemTicket();
  const generateMutation = useGenerateTicket();

  const handleActivate = () => {
    if (!code || code.length < 5) return;
    redeemMutation.mutate(code, {
      onSuccess: () => {
        setSuccessOpen(true);
        setCode('');
      },
    });
  };

  const handleGenerate = () => {
    if (isBusinessAdmin && !selectedLocationId) return;
    generateMutation.mutate(selectedLocationId as number, {
      onSuccess: (data) => {
        setGeneratedCode(data.code);
        setSuccessOpen(true);
      },
    });
  };

  const handleCloseSnackbar = () => setSuccessOpen(false);

  return (
    <Box p={2} pt={3} sx={{ display: 'flex', flexDirection: 'column' }}>
      <Container
        maxWidth='xs'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pb: 4,
        }}
      >
        {/* --- DYNAMIC VISUAL SECTION --- */}
        {isBusiness ? (
          /* Business View: Dashed Border Paper with QR */
          <Paper
            elevation={0}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 5,
              border: `2px dashed ${primaryColor}4D`,
              bgcolor: `${primaryColor}05`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 300,
              justifyContent: 'center',
              mb: 4,
            }}
          >
            {generatedCode ? (
              <Stack alignItems='center' spacing={3}>
                <Box
                  sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: 1 }}
                >
                  <QRCode
                    value={generatedCode}
                    size={180}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ textTransform: 'uppercase', fontWeight: 700 }}
                  >
                    Customer Code
                  </Typography>
                  <Typography
                    variant='h3'
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 4,
                      color: primaryColor,
                      fontFamily: 'monospace',
                    }}
                  >
                    {generatedCode}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Stack alignItems='center' spacing={2} color='text.disabled'>
                <QrCode2Icon sx={{ fontSize: 80, opacity: 0.5 }} />
                <Typography variant='body2'>
                  No active code generated
                </Typography>
              </Stack>
            )}
          </Paper>
        ) : (
          /* User View: Artistic Ticket Graphic */
          <Box
            sx={{
              width: 192,
              height: 192,
              mb: 4,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: `${primaryColor}1A`,
                borderRadius: '50%',
                transform: 'scale(1.1)',
              }}
            />
            <Paper
              elevation={4}
              sx={{
                width: 128,
                height: 150,
                position: 'relative',
                zIndex: 10,
                transform: 'rotate(-3deg)',
                p: 2,
                border: `2px solid ${primaryColor}33`,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'white',
              }}
            >
              <Box
                sx={{
                  height: 8,
                  width: '75%',
                  bgcolor: `${primaryColor}33`,
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  height: 8,
                  width: '50%',
                  bgcolor: `${primaryColor}1A`,
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  mt: 'auto',
                  borderTop: `2px dashed ${primaryColor}4D`,
                  pt: 2,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 0.5,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: i % 2 === 0 ? `${primaryColor}66` : primaryColor,
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </Box>
            </Paper>
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 20,
                width: 48,
                height: 48,
                bgcolor: primaryColor,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(12deg)',
                boxShadow: 3,
              }}
            >
              <QrCode2Icon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
        )}

        {/* --- HEADER TEXT --- */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
            {isBusiness ? 'Create New Ticket' : 'Got a code?'}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {isBusiness
              ? 'Generate a unique code for your customer to join the Winnbell draw.'
              : 'Enter the code from your receipt to activate your ticket and join the draw.'}
          </Typography>
        </Box>

        {/* --- ACTION AREA --- */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {isBusiness ? (
            /* BUSINESS BUTTONS */
            <Stack spacing={2}>
           
                <Box>
                        <Button
                variant='contained'
                fullWidth
                size='large'
                onClick={handleGenerate}
                disabled={generateMutation.isPending || (isBusinessAdmin && !selectedLocationId)}
                startIcon={
                  generateMutation.isPending ? (
                    <CircularProgress size={20} color='inherit' />
                  ) : (
                    <AddCircleOutline />
                  )
                }
                sx={{
                  height: 64,
                  borderRadius: 4,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  bgcolor: primaryColor,
                  boxShadow: `0 8px 20px ${primaryColor}4D`,
                }}
              >
                {generatedCode ? 'Generate New Code' : 'Generate Ticket'}
              </Button>
                 {isBusinessAdmin && locations.length > 0 && (
              <Stack>
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      color: 'text.secondary',
                      mb: 1.5,mt:3,
                      display: 'block',
                    }}
                  >
                    Select Branch
                  </Typography>
                  <Stack spacing={1}>
                    
                    {locations.map((loc) => {
                      const isSelected = selectedLocationId === loc.id;
                      return (
                        <Paper
                          key={loc.id}
                          elevation={0}
                          onClick={() => setSelectedLocationId(loc.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: isSelected ? primaryColor : 'divider',
                            bgcolor: isSelected ? `${primaryColor}08` : 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              borderColor: isSelected ? primaryColor : `${primaryColor}66`,
                              bgcolor: `${primaryColor}05`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              bgcolor: isSelected ? primaryColor : `${primaryColor}12`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <Storefront
                              sx={{
                                fontSize: 18,
                                color: isSelected ? 'white' : primaryColor,
                              }}
                            />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              variant='body2'
                              fontWeight={700}
                              noWrap
                              sx={{ color: isSelected ? primaryColor : 'text.primary' }}
                            >
                              {loc.name}
                            </Typography>
                            {loc.address && (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                noWrap
                                sx={{ display: 'block' }}
                              >
                                {loc.address}
                              </Typography>
                            )}
                          </Box>
                          {isSelected && (
                            <CheckCircle
                              sx={{ fontSize: 20, color: primaryColor, flexShrink: 0 }}
                            />
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                  </Stack>
                        )}
                </Box>
        
        
              {generatedCode && (
                <Button
                  variant='text'
                  sx={{ color: 'text.secondary', fontWeight: 700 }}
                  onClick={() => setGeneratedCode(null)}
                >
                  Clear Screen
                </Button>
              )}
            </Stack>
          ) : (
            /* USER FORM */
            <>
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 600, mb: 1, px: 0.5 }}
                >
                  Ticket Code
                </Typography>
                <TextField
                  fullWidth
                  placeholder='XXXXXXXX'
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  variant='outlined'
                  disabled={redeemMutation.isPending}
                  error={redeemMutation.isError}
                  helperText={
                    redeemMutation.isError
                      ? (redeemMutation.error as any).response?.data?.message ||
                        'Invalid code'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Edit sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 3,
                      bgcolor: 'action.hover',
                      fontSize: '1.25rem',
                      fontFamily: 'monospace',
                      height: 64,
                      '& input': { textAlign: 'center' },
                    },
                  }}
                />
              </Box>
              <Stack spacing={2}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleActivate}
                  disabled={redeemMutation.isPending || code.length < 5}
                  endIcon={
                    redeemMutation.isPending ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <Bolt />
                    )
                  }
                  sx={{
                    bgcolor: primaryColor,
                    height: 56,
                    borderRadius: 3,
                    fontWeight: 700,
                    boxShadow: `${primaryColor}4D 0px 10px 15px -3px`,
                  }}
                >
                  Activate Ticket
                </Button>

                <Paper
                  elevation={0}
                  onClick={() => navigate('/freeTicket')}
                  sx={{
                    p: 1,
                    px: 3,
                    borderRadius: 4,
                    bgcolor: `${primaryColor}0A`,
                    border: `1px solid ${primaryColor}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: '0.2s',
                    '&:hover': {
                      bgcolor: `${primaryColor}14`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: primaryColor,
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      color: 'white',
                    }}
                  >
                    <CardGiftcard fontSize='small' />
                  </Box>
                  <Stack flex={1}>
                    <Typography variant='body2' fontWeight={700}>
                      free weekly ticket
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Claim your 1 free entry for this week
                    </Typography>
                  </Stack>
                  <Box sx={{ color: primaryColor, fontWeight: 900 }}>&gt;</Box>
                </Paper>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}
                >
                  <Divider sx={{ flex: 1 }} />
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      color: 'text.disabled',
                      textTransform: 'uppercase',
                    }}
                  >
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                <Button
                  variant='outlined'
                  size='large'
                  fullWidth
                  startIcon={<QrCodeScanner />}
                  sx={{
                    color: primaryColor,
                    borderColor: primaryColor,
                    height: 56,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderWidth: 2,
                  }}
                >
                  Scan QR Code
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Container>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity='success' variant='filled'>
          {isBusiness
            ? 'Ticket Generated Successfully!'
            : 'Ticket activated successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RedeemPage;
