import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import {
  Close,
  StorefrontOutlined,
  ReceiptLongOutlined,
  CardGiftcard,
  EmojiEventsOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MAX_ENTRIES_PER_DRAW } from '../../../shared/constants/entries';
import {
  PRIMARY_MAIN,
  PRIMARY_LIGHT,
  PRIMARY_DEEP,
  GRADIENT_PRIMARY,
  ACCENT_GOLD,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../../../shared/colors';
import { staggerContainer, riseIn, SPRING_POP } from '../../../shared/motion';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: StorefrontOutlined,
    title: 'Visit Local Businesses',
    description: 'Find participating businesses near you using the Winnbell map',
    color: PRIMARY_LIGHT,
  },
  {
    icon: ReceiptLongOutlined,
    title: 'Submit Your Receipt',
    description: `Visit a participating business and submit your receipt to earn a campaign entry. Up to ${MAX_ENTRIES_PER_DRAW} entries per campaign per member.`,
    color: PRIMARY_MAIN,
  },
  {
    icon: CardGiftcard,
    title: 'Get Your Free Entry',
    description: 'Every member gets 1 free entry every week - no purchase needed',
    color: PRIMARY_DEEP,
  },
  {
    icon: EmojiEventsOutlined,
    title: 'A Chance to Win',
    description: 'Every valid entry gives you a chance to win in the monthly prize draw',
    color: ACCENT_GOLD,
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
          borderRadius: '15px',
          overflow: 'hidden',
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
      {/* Premium Gradient Header */}
      <Box
        sx={{
          background: GRADIENT_PRIMARY,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft glowing radial-gradient accents (not filter:blur - preserves Android clipping) */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -70,
            left: -60,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Close button positioned in header */}
        <IconButton
          onClick={onClose}
          size='small'
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            zIndex: 10,
          }}
        >
          <Close fontSize='small' />
        </IconButton>

        {/* Heading with position relative for z-index layering */}
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: -0.3,
            position: 'relative',
            zIndex: 1,
            mt: 1,
          }}
        >
          How Winnbell Works
        </Typography>
      </Box>

      {/* Content with staggered step animations */}
      <DialogContent
        sx={{
          pt: 4,
          pb: 3,
          px: 3,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Steps Timeline Container */}
        <Box
          component={motion.div}
          variants={staggerContainer}
          initial='hidden'
          animate={open ? 'visible' : 'hidden'}
          sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <Box
                key={idx}
                component={motion.div}
                variants={riseIn}
                sx={{
                  display: 'flex',
                  gap: 2.5,
                  pb: isLast ? 0 : 2.5,
                  position: 'relative',
                }}
              >
                {/* Vertical connector line (appears between steps, not on last) */}
                {!isLast && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 27.5,
                      top: 56,
                      width: 2,
                      height: 'calc(100% - 56px)',
                      bgcolor: 'divider',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Numbered Icon Chip */}
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
                    boxShadow: `0 4px 16px ${step.color}35`,
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>

                {/* Step Content */}
                <Box sx={{ flex: 1, pt: 0.5 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      mb: 0.5,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {idx + 1}. {step.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: '0.85rem',
                      color: TEXT_SECONDARY,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Legal Note */}
        <Box
          component={motion.div}
          variants={riseIn}
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
              color: TEXT_SECONDARY,
              lineHeight: 1.6,
            }}
          >
            No purchase necessary. Open to eligible residents only. See official rules for details.
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2.5, bgcolor: 'background.paper' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={SPRING_POP}
          style={{ width: '100%' }}
        >
          <Button
            onClick={onClose}
            variant='contained'
            color='primary'
            fullWidth
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              py: 1.3,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: `0 4px 16px ${PRIMARY_MAIN}30`,
              transition: 'all 180ms ease-out',
              '&:hover': {
                boxShadow: `0 6px 24px ${PRIMARY_MAIN}40`,
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Got it!
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

export default HowItWorksModal;
