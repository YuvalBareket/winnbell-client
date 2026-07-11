import { Box, Typography, Stack, Button } from '@mui/material';
import { CheckRounded } from '@mui/icons-material';
import { TIER_KEYS, TIER_MAP, PLAN_META } from './subscribeTiers';
import {
  PRIMARY_MAIN,
  PRIMARY_DEEP,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
  STATUS_ACTIVATED_TEXT,
} from '../../../../shared/colors';

interface PlanCardsProps {
  selectedTier: number;
  onSelect: (tier: number) => void;
  disabled?: boolean;
}

// The 3-plan picker (Low / Medium / High Volume). Shared by the subscribe flow and the
// plan-change management page so both stay in sync with subscribeTiers.
// Matches the design precisely: white cards, price-forward layout, blue capacity highlight,
// green check icons, select/selected buttons, popular badge on the Medium Volume plan.
const PlanCards = ({ selectedTier, onSelect, disabled }: PlanCardsProps) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
    {TIER_KEYS.map((tier) => {
      const meta = PLAN_META[tier];
      const price = TIER_MAP[tier];
      const selected = tier === selectedTier;
      return (
        <Box
          key={tier}
          onClick={() => !disabled && onSelect(tier)}
          sx={{
            position: 'relative',
            cursor: disabled ? 'default' : 'pointer',
            background: '#fff',
            border: selected ? `2px solid ${PRIMARY_MAIN}` : `1px solid ${BORDER_SUBTLE}`,
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: selected ? `0 16px 34px -18px rgba(21,101,192,.5)` : 'none',
            transition: 'all 0.2s ease',
            '&:hover': disabled ? {} : {
              borderColor: PRIMARY_MAIN,
              boxShadow: `0 8px 24px rgba(21,101,192,0.15)`,
            },
          }}
        >
          {meta.popular && (
            <Box
              sx={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: `linear-gradient(135deg, ${PRIMARY_MAIN}, ${PRIMARY_DEEP})`,
                color: '#fff',
                fontSize: '10.5px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: '999px',
                padding: '4px 13px',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 14px -4px rgba(21,101,192,.5)',
              }}
            >
              Most popular
            </Box>
          )}

          {/* Plan name */}
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: selected ? PRIMARY_MAIN : TEXT_SECONDARY,
            }}
          >
            {meta.name}
          </Typography>

          {/* Tagline */}
          <Typography
            sx={{
              fontSize: '12px',
              color: TEXT_TERTIARY,
              fontWeight: 500,
              marginTop: '2px',
              marginBottom: '16px',
            }}
          >
            {meta.tagline}
          </Typography>

          {/* Price row */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '10px' }}>
            <Typography
              sx={{
                fontSize: '32px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: PRIMARY_DEEP,
              }}
            >
              ${price}
            </Typography>
            <Typography
              sx={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: TEXT_TERTIARY,
              }}
            >
              / location / month
            </Typography>
          </Box>

          {/* Capacity line - describes campaign capacity, never per-entry value */}
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: PRIMARY_MAIN,
              marginTop: '10px',
              marginBottom: '16px',
            }}
          >
            Monthly campaign capacity: up to {tier.toLocaleString()} entries
          </Typography>

          {/* Divider (hidden on mobile with the feature list) */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, height: '1px', background: BORDER_SUBTLE, marginBottom: '16px' }} />

          {/* "Included:" label above the feature list - hidden on mobile with the list */}
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: TEXT_TERTIARY,
              marginBottom: '10px',
            }}
          >
            Included:
          </Typography>

          {/* Features (flex:1 to push button to bottom) - hidden on mobile */}
          <Stack spacing={1.125} sx={{ display: { xs: 'none', sm: 'flex' }, flex: 1, marginBottom: { xs: 0, sm: '18px' } }}>
            {meta.features.map((f) => (
              <Stack key={f} direction='row' spacing={1} alignItems='flex-start'>
                <CheckRounded
                  sx={{
                    fontSize: '16px',
                    color: STATUS_ACTIVATED_TEXT,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '12.5px',
                    color: TEXT_SECONDARY,
                    lineHeight: 1.4,
                  }}
                >
                  {f}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Select/Selected button */}
          <Button
            fullWidth
            onClick={(e) => { e.stopPropagation(); if (!disabled) onSelect(tier); }}
            disabled={disabled}
            sx={{
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '11px',
              padding: '12px',
              textTransform: 'none',
              ...(selected
                ? {
                    background: `linear-gradient(135deg, ${PRIMARY_MAIN}, ${PRIMARY_DEEP})`,
                    color: '#fff',
                    border: 'none',
                    boxShadow: `0 8px 18px -8px rgba(21,101,192,.5)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${PRIMARY_MAIN}, ${PRIMARY_DEEP})`,
                      boxShadow: `0 12px 24px -8px rgba(21,101,192,.5)`,
                    },
                  }
                : {
                    background: '#fff',
                    color: PRIMARY_DEEP,
                    border: `1.5px solid ${BORDER_SUBTLE}`,
                    '&:hover': {
                      background: '#fff',
                      borderColor: PRIMARY_MAIN,
                      boxShadow: `0 4px 12px rgba(21,101,192,0.1)`,
                    },
                  }),
            }}
          >
            {selected ? 'Selected' : 'Select'}
          </Button>
        </Box>
      );
    })}
  </Box>
);

export default PlanCards;
