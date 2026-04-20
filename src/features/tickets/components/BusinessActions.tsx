import React from 'react';
import {
  Stack,
  Button,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  AddCircleOutline,
  Storefront,
  CheckCircle,
} from '@mui/icons-material';

interface BusinessLocation {
  id: number;
  name: string;
  address?: string;
}

interface BusinessActionsProps {
  handleGenerate: () => void;
  generateMutation: { isPending: boolean };
  isBusinessAdmin: boolean;
  selectedLocationId: number | '';
  setSelectedLocationId: (id: number) => void;
  locations: BusinessLocation[];
  generatedCode: string | null;
  setGeneratedCode: (code: string | null) => void;
  primaryColor: string;
}

const BusinessActions: React.FC<BusinessActionsProps> = ({
  handleGenerate,
  generateMutation,
  isBusinessAdmin,
  selectedLocationId,
  setSelectedLocationId,
  locations,
  generatedCode,
  setGeneratedCode,
  primaryColor,
}) => (
  <Stack spacing={2}>
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
        transition: 'box-shadow 160ms ease-out',
        '&:active': {
          transform: 'scale(0.97)',
          transition: 'transform 160ms ease-out',
        },
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
            mb: 1.5,
            mt: 2,
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
                  transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out',
                  '&:hover': {
                    borderColor: isSelected ? primaryColor : `${primaryColor}66`,
                    bgcolor: `${primaryColor}05`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                  '&:active': {
                    transform: 'scale(0.97)',
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
                    transition: 'background-color 150ms ease-out',
                  }}
                >
                  <Storefront sx={{ fontSize: 18, color: isSelected ? 'white' : primaryColor }} />
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
                    <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block' }}>
                      {loc.address}
                    </Typography>
                  )}
                </Box>
                {isSelected && (
                  <CheckCircle sx={{ fontSize: 20, color: primaryColor, flexShrink: 0 }} />
                )}
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    )}

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
);

export default BusinessActions;
