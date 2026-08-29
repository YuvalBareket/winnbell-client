import React from 'react';
import {
  Box,
  Container,
  Stack,
  Avatar,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Verified, Edit, CameraAlt } from '@mui/icons-material';
import { GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, VERIFIED_BLUE } from '../../../../shared/colors';
import { BUSINESS_SECTORS } from '../../../admin/data';

interface BusinessData {
  name: string;
  logo_url: string | null;
  sector: string;
  is_subscribed: boolean;
}

interface BusinessHeroSectionProps {
  business: BusinessData;
  onLogoClick: () => void;
  isUploading: boolean;
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick?: () => void;
  header?: React.ReactNode;
}

const BusinessHeroSection: React.FC<BusinessHeroSectionProps> = ({
  business,
  onLogoClick,
  isUploading,
  logoFileInputRef,
  onFileChange,
  onEditClick,
  header,
}) => {
  const sectorUI = BUSINESS_SECTORS[business.sector] || BUSINESS_SECTORS.Retail;

  return (
    <Box
      sx={{
        background: GRADIENT_HERO,
        pb: 9,
        color: 'white',
        borderRadius: '0 0 32px 32px',
      }}
    >
      {header}
      <Container maxWidth='lg' sx={{ px: 3, pt: 1 }}>
        {/* minWidth 0 down the chain + wrapping chips: without them the nowrap chips fix
            this row's minimum width above small viewports, shoving the edit button off
            screen and making the whole page horizontally scrollable. */}
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
          <Stack direction='row' alignItems='center' spacing={2} sx={{ minWidth: 0, flex: 1 }}>
            <Box
              onClick={onLogoClick}
              sx={{
                position: 'relative', width: 72, height: 72, borderRadius: '50%',
                cursor: 'pointer', flexShrink: 0,
                '&:hover .logo-overlay': { opacity: 1 },
              }}
            >
              <Avatar
                alt=''
                src={business.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${business.logo_url}` : undefined}
                sx={{
                  width: 72, height: 72,
                  bgcolor: ALPHA_WHITE_15,
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 28,
                  border: `2px solid ${ALPHA_WHITE_30}`,
                }}
              >
                {business.name[0]}
              </Avatar>
              <Box
                className='logo-overlay'
                sx={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isUploading ? 1 : 0,
                  transition: 'opacity 0.2s',
                }}
              >
                {isUploading
                  ? <CircularProgress size={22} sx={{ color: 'white' }} />
                  : <CameraAlt sx={{ fontSize: 22, color: 'white' }} />}
              </Box>
              <input
                ref={logoFileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant='h5'
                fontWeight={800}
                sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
              >
                {business.name}
                <Verified sx={{ fontSize: 20, color: VERIFIED_BLUE }} />
              </Typography>
              <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' mt={0.5}>
                <Chip
                  label={sectorUI.label}
                  size='small'
                  sx={{ bgcolor: ALPHA_WHITE_15, color: 'white', fontWeight: 700, borderRadius: 2, fontSize: { xs: 12, sm: 13 } }}
                />
                {!business.is_subscribed && (
                  <Chip label='Pending Activation' size='small' sx={{ fontWeight: 700, borderRadius: 2, bgcolor: ALPHA_WHITE_20, color: 'white', fontSize: { xs: 12, sm: 13 }, '& .MuiChip-label': { px: { xs: 1, sm: 1.5 } } }} />
                )}
              </Stack>
            </Box>
          </Stack>
          {onEditClick && (
            <IconButton
              onClick={onEditClick}
              aria-label='Edit business details'
              sx={{ color: 'white', border: `1px solid ${ALPHA_WHITE_30}`, borderRadius: 2, flexShrink: 0 }}
            >
              <Edit />
            </IconButton>
          )}
        </Stack>

      </Container>
    </Box>
  );
};

export default BusinessHeroSection;
