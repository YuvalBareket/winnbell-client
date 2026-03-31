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
import { GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, VERIFIED_BLUE } from '../../../../shared/colors';
import { BUSINESS_SECTORS } from '../../../admin/data';

interface BusinessData {
  name: string;
  logo_url: string | null;
  sector: string;
  is_active: boolean;
}

interface BusinessHeroSectionProps {
  business: BusinessData;
  onLogoClick: () => void;
  isUploading: boolean;
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick?: () => void;
}

const BusinessHeroSection: React.FC<BusinessHeroSectionProps> = ({
  business,
  onLogoClick,
  isUploading,
  logoFileInputRef,
  onFileChange,
  onEditClick,
}) => {
  const sectorUI = BUSINESS_SECTORS[business.sector] || BUSINESS_SECTORS.Retail;

  return (
    <Box
      sx={{
        background: GRADIENT_HERO,
        pt: 3,
        pb: 9,
        px: 3,
        color: 'white',
        borderRadius: '0 0 32px 32px',
      }}
    >
      <Container maxWidth='md'>
        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ pt: { xs: '40px', md: 0 } }}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box
              onClick={onLogoClick}
              sx={{
                position: 'relative', width: 64, height: 64, borderRadius: 2,
                cursor: 'pointer', flexShrink: 0,
                '&:hover .logo-overlay': { opacity: 1 },
              }}
            >
              <Avatar
                variant='square'
                src={business.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${business.logo_url}` : undefined}
                sx={{
                  width: 64, height: 64,
                  bgcolor: ALPHA_WHITE_15,
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 28,
                  borderRadius: 2,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                }}
              >
                {business.name[0]}
              </Avatar>
              <Box
                className='logo-overlay'
                sx={{
                  position: 'absolute', inset: 0, borderRadius: 2,
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
            <Box>
              <Typography
                variant='h5'
                fontWeight={800}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {business.name}
                <Verified sx={{ fontSize: 20, color: VERIFIED_BLUE }} />
              </Typography>
              <Stack direction='row' spacing={1} mt={0.5}>
                <Chip
                  label={sectorUI.label}
                  size='small'
                  sx={{ bgcolor: ALPHA_WHITE_15, color: 'white', fontWeight: 700, borderRadius: 2 }}
                />
                {business.is_active ? (
                  <Chip label='Active Partner' size='small' color='success' sx={{ fontWeight: 700, borderRadius: 2 }} />
                ) : (
                  <Chip label='Pending Activation' size='small' sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                )}
              </Stack>
            </Box>
          </Stack>
          <IconButton
            onClick={onEditClick}
            sx={{ color: 'white', border: `1px solid ${ALPHA_WHITE_30}`, borderRadius: 2 }}
          >
            <Edit />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default BusinessHeroSection;
