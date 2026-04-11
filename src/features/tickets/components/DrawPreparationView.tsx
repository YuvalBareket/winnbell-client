import {
  Box, Container, Typography, Paper, Chip, Divider, LinearProgress,
} from '@mui/material';
import {
  EmojiEvents, CheckCircle, RadioButtonUnchecked, CalendarMonth, OpenInNew,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
} from '../../../shared/colors';
import type { SubscriptionDetails } from '../../subscription/hooks/useSubscription';

interface DrawPreparationViewProps {
  subscription: SubscriptionDetails | undefined;
  hasDescription: boolean;
  hasLocations: boolean;
  isDesktop: boolean;
}

const DrawPreparationView = ({
  subscription,
  hasDescription,
  hasLocations,
  isDesktop,
}: DrawPreparationViewProps) => {
  const navigate = useNavigate();

  const drawDate = subscription?.draw_date ? new Date(subscription.draw_date) : null;
  const daysUntil = drawDate
    ? Math.ceil((drawDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const prizeAmount = subscription?.prize_amount
    ? `$${Number(subscription.prize_amount).toFixed(0)}`
    : null;

  const checklist = [
    { label: 'Subscription active', done: true },
    { label: `Registered for ${subscription?.draw_name ?? 'upcoming draw'}`, done: true },
    { label: 'Complete your business description', done: hasDescription, path: '/nearby' },
    { label: 'Add at least one active location', done: hasLocations, path: '/nearby' },
    { label: 'Go live on the map when draw opens', done: false, info: true },
  ];
  const taskItems = checklist.filter(c => !c.info);
  const completedCount = taskItems.filter(c => c.done).length;
  const progress = (completedCount / taskItems.length) * 100;

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: isDesktop ? 'auto' : 'calc(100vh - 138px)', pb: 6 }}>
      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <Container maxWidth='lg'>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEvents sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>Preparing for Your Draw</Typography>
              <Typography variant='body2' sx={{ opacity: 0.75, mt: 0.25 }}>
                You're registered — your business goes live when the draw opens
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: -5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 3, alignItems: 'flex-start' }}>

          {/* Left: Draw info card */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ background: GRADIENT_HERO, p: 3, color: 'white' }}>
              <Typography variant='overline' sx={{ opacity: 0.8, letterSpacing: 1.5 }}>Registered Draw</Typography>
              <Typography variant='h6' fontWeight={800} sx={{ mt: 0.5 }}>
                {subscription?.draw_name ?? 'Upcoming Monthly Draw'}
              </Typography>
              {drawDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CalendarMonth sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography variant='body2' sx={{ opacity: 0.9 }}>
                    {drawDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {daysUntil !== null && (
                  <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(25,93,230,0.05)', borderRadius: 2 }}>
                    <Typography variant='h4' fontWeight={800} color='primary'>{daysUntil}</Typography>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>days to go</Typography>
                  </Box>
                )}
                {prizeAmount && (
                  <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'rgba(46,125,50,0.05)', borderRadius: 2 }}>
                    <Typography variant='h4' fontWeight={800} sx={{ color: 'success.main' }}>{prizeAmount}</Typography>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>prize pool</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ p: 2, bgcolor: 'rgba(25,93,230,0.04)', borderRadius: 2, border: '1px solid rgba(25,93,230,0.1)' }}>
                <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                  When the draw opens, you'll be able to generate unique ticket codes for your customers. Each activated code enters them into the prize draw.
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Right: Preparation checklist */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='h6' fontWeight={800}>Preparation Checklist</Typography>
              <Chip label={`${completedCount}/${taskItems.length}`} size='small' color={completedCount === taskItems.length ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
            </Box>
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{ mb: 3, height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 3 } }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {checklist.map((item, i) => (
                <Box
                  key={i}
                  onClick={() => !item.done && item.path && navigate(item.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: 1.5, borderRadius: 2,
                    bgcolor: item.done ? 'rgba(46,125,50,0.04)' : item.info ? 'rgba(25,93,230,0.03)' : 'rgba(0,0,0,0.02)',
                    border: '1px solid',
                    borderColor: item.done ? 'rgba(46,125,50,0.15)' : item.info ? 'rgba(25,93,230,0.12)' : 'divider',
                    cursor: !item.done && item.path ? 'pointer' : 'default',
                    '&:hover': !item.done && item.path ? { bgcolor: 'rgba(25,93,230,0.04)' } : {},
                    transition: 'background 0.15s',
                  }}
                >
                  {item.done
                    ? <CheckCircle sx={{ fontSize: 20, color: 'success.main', flexShrink: 0 }} />
                    : item.info
                      ? <EmojiEvents sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0, opacity: 0.6 }} />
                      : <RadioButtonUnchecked sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />}
                  <Typography variant='body2' fontWeight={600} color={item.done ? 'text.primary' : item.info ? 'primary.main' : 'text.secondary'} flex={1}>
                    {item.label}
                  </Typography>
                  {!item.done && item.path && <OpenInNew sx={{ fontSize: 14, color: 'text.disabled' }} />}
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7 }}>
              <strong>Ticket generation opens when the draw starts.</strong> In the meantime, make sure your profile is complete so customers can find you on the map and know what you offer.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default DrawPreparationView;
