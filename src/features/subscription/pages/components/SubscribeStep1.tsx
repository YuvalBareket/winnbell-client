import {
  Box, Button, Typography, Stack, CircularProgress, Alert,
} from '@mui/material';
import {
  PRIMARY_MAIN,
  PRIMARY_DEEP,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
  BG_SUBTLE,
  STATUS_ACTIVATED_TEXT,
} from '../../../../shared/colors';

interface Props {
  thresholdInput: string;
  setThresholdInput: (v: string) => void;
  isThresholdValid: boolean;
  parsedThreshold: number | null;
  savingThreshold: boolean;
  errorMessage?: string;
  onContinue: () => void;
  onSkip: () => void;
}

const SubscribeStep1 = ({
  thresholdInput,
  setThresholdInput,
  isThresholdValid,
  parsedThreshold,
  savingThreshold,
  errorMessage,
  onContinue,
  onSkip,
}: Props) => {
  const displayValue = parsedThreshold ?? (thresholdInput ? parseFloat(thresholdInput) : 0);

  return (
    <Box sx={{ px: { xs: 0, md: 5 }, pt: { xs: 0.5, md: 5 }, pb: { xs: 2, md: 5 } }}>
      {/* Two-column grid: form left, live preview right */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 400px' },
        gap: { xs: 2, md: 3.5 },
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN: Form */}
        <Box>
          {/* Heading */}
          <Typography
            sx={{
              fontSize: { xs: '20px', md: '24px' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: TEXT_PRIMARY,
              mb: 0.75,
            }}
          >
            Start your campaign
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: '13.5px',
              color: TEXT_SECONDARY,
              lineHeight: 1.6,
              mb: 3,
            }}
          >
            Set a minimum receipt amount for entry eligibility, or accept any receipt amount from your store.
          </Typography>

          {/* Label */}
          <Typography
            sx={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: TEXT_SECONDARY,
              mb: 0.875,
            }}
          >
            Minimum spend per receipt
          </Typography>

          {/* Input field with $ prefix */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: '#fff',
              border: `1.5px solid ${PRIMARY_MAIN}`,
              borderRadius: '12px',
              padding: '15px 16px',
              boxShadow: `0 0 0 3px rgba(21,101,192,.1)`,
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '17px',
                fontWeight: 800,
                color: TEXT_TERTIARY,
              }}
            >
              $
            </Typography>
            <input
              type='text'
              value={thresholdInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^\d*\.?\d*$/.test(v)) setThresholdInput(v);
              }}
              placeholder='0'
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: TEXT_PRIMARY,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                fontFamily: 'inherit',
              }}
            />
          </Box>

          {/* Helper text */}
          <Typography
            sx={{
              fontSize: '12px',
              color: TEXT_TERTIARY,
              fontWeight: 500,
              mb: 3.5,
            }}
          >
            Set the minimum receipt amount required to earn an entry.
          </Typography>

          {/* Error message */}
          {errorMessage && (
            <Alert severity='error' sx={{ borderRadius: '12px', mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Continue Button */}
          <Button
            fullWidth
            onClick={onContinue}
            disabled={!isThresholdValid || savingThreshold}
            sx={{
              py: '15px',
              fontWeight: 800,
              fontSize: '15px',
              color: '#fff',
              background: `linear-gradient(135deg, ${PRIMARY_MAIN}, ${PRIMARY_DEEP})`,
              borderRadius: '13px',
              boxShadow: '0 4px 14px rgba(21,101,192,.3)',
              textTransform: 'none',
              mb: 1.75,
              '&:hover:not(:disabled)': {
                boxShadow: '0 6px 20px rgba(21,101,192,.4)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {savingThreshold ? <CircularProgress size={22} color='inherit' /> : 'Continue'}
          </Button>

          {/* Skip link */}
          <Typography
            onClick={onSkip}
            sx={{
              textAlign: 'center',
              fontSize: '12.5px',
              color: TEXT_TERTIARY,
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.7,
              },
            }}
          >
            I'll do it later
          </Typography>
        </Box>

        {/* RIGHT COLUMN: Live Preview */}
        <Box sx={{
          background: '#fff',
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 22px -14px rgba(15,39,71,.18)',
        }}>
          {/* Label */}
          <Typography
            sx={{
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PRIMARY_MAIN,
              mb: 0.5,
            }}
          >
            Live preview
          </Typography>

          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: '13px',
              color: TEXT_TERTIARY,
              fontWeight: 500,
              mb: 2.25,
            }}
          >
            What a customer earns at ${displayValue.toFixed(2)} minimum
          </Typography>

          {/* Preview rows */}
          <Stack spacing={1.5}>
            {displayValue > 0 ? (
              <>
                {/* Below minimum */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: BG_SUBTLE,
                    border: `1px solid ${BORDER_SUBTLE}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                  }}
                >
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: TEXT_TERTIARY }}>
                    ${(displayValue - 1).toFixed(2)} receipt
                  </Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 800, color: TEXT_TERTIARY }}>
                    no entry
                  </Typography>
                </Box>

                {/* At minimum */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(46,125,50,.06)',
                    border: '1px solid rgba(46,125,50,.2)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                  }}
                >
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: TEXT_PRIMARY }}>
                    ${displayValue.toFixed(2)} receipt
                  </Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 800, color: STATUS_ACTIVATED_TEXT }}>
                    1 entry
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
                Enter an amount above to preview
              </Typography>
            )}
          </Stack>

          {/* Footnote */}
          <Box sx={{ display: 'flex', gap: 1.125, alignItems: 'flex-start', mt: 2.25, pt: 2, borderTop: `1px solid ${BG_SUBTLE}` }}>
            <Typography sx={{ fontSize: '12px', color: TEXT_TERTIARY, lineHeight: 1.5, flex: 1 }}>
              One entry per full multiple of your minimum.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SubscribeStep1;
