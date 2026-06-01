import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import {
  Close,
  AccountCircleOutlined,
  StorefrontOutlined,
  ReceiptLongOutlined,
  CardGiftcard,
  EmojiEventsOutlined,
} from '@mui/icons-material';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: AccountCircleOutlined,
    title: 'Sign Up',
    description: 'Create your free Winnbell account in seconds',
    color: '#3b82f6', // primary.main (blue)
  },
  {
    icon: StorefrontOutlined,
    title: 'Visit Partner Businesses',
    description: 'Find participating partner businesses near you using the Winnbell map',
    color: '#10b981', // green
  },
  {
    icon: ReceiptLongOutlined,
    title: 'Submit Your Receipt',
    description: 'Visit a participating partner business and submit your receipt to earn a campaign entry. Up to 30 entries per campaign per member.',
    color: '#f59e0b', // amber
  },
  {
    icon: CardGiftcard,
    title: 'Get Your Free Entry',
    description: 'Every member gets 1 free entry every week - no purchase needed',
    color: '#8b5cf6', // violet
  },
  {
    icon: EmojiEventsOutlined,
    title: 'Win Monthly Prizes',
    description: 'A winner is drawn at the end of each monthly campaign from all valid entries',
    color: '#ef4444', // red
  },
];

const HowItWorksModal = ({ open, onClose }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 800,
          fontSize: '1.25rem',
          pb: 2,
        }}
      >
        How Winnbell Works
        <IconButton
          onClick={onClose}
          size='small'
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <Close fontSize='small' />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        <Stack spacing={3} sx={{ py: 1 }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                {/* Icon Badge */}
                <Box
                  sx={{
                    minWidth: 56,
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: step.color,
                    color: 'white',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${step.color}40`,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>

                {/* Text */}
                <Box sx={{ flex: 1, pt: 0.5 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      mb: 0.5,
                    }}
                  >
                    {idx + 1}. {step.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: '0.85rem',
                      color: 'text.secondary',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        {/* Legal Note */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant='caption'
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            No purchase necessary. Open to eligible residents only. See official rules for details.
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant='contained'
          color='primary'
          fullWidth
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            py: 1.2,
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HowItWorksModal;
