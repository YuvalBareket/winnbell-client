import {
  Box, Container, Typography, Paper, Chip, Divider, LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  EmojiEvents, CheckCircle, RadioButtonUnchecked, CalendarMonth, OpenInNew,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GRADIENT_HERO } from '../../../shared/colors';
import type { SubscriptionDetails } from '../../subscription/hooks/useSubscription';
import AppPageHero from '../../../shared/components/AppPageHero';

interface DrawPreparationViewProps {
  subscription: SubscriptionDetails | undefined;
  hasDescription: boolean;
  hasLocations: boolean;
  isDesktop: boolean;
  isManager?: boolean;
  isSubscribed?: boolean;
}

const DrawPreparationView = ({
  subscription,
  hasDescription,
  hasLocations,
  isDesktop,
  isManager = false,
  isSubscribed = true,
}: DrawPreparationViewProps) => {
  const navigate = useNavigate();

  const drawDate = subscription?.draw_date ? new Date(subscription.draw_date) : null;
  const daysUntil = drawDate
    ? Math.ceil((drawDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const prizeAmount = subscription?.prize_amount
    ? `$${Number(subscription.prize_amount).toFixed(0)}`
    : null;

  const checklist = isSubscribed
    ? [
        { label: 'Subscription active', done: true },
        { label: `Registered for ${subscription?.draw_name ?? 'upcoming campaign'}`, done: true },
        { label: 'Complete your business description', done: hasDescription, path: '/nearby' },
        { label: 'Add at least one active location', done: hasLocations, path: '/nearby' },
        { label: 'Go live on the map when campaign opens', done: false, info: true },
      ]
    : [
        { label: 'Subscribe to a campaign plan', done: false, path: '/subscribe' },
        { label: 'Complete your business description', done: hasDescription, path: '/nearby' },
        { label: 'Add at least one active location', done: hasLocations, path: '/nearby' },
        { label: 'Go live on the map when your campaign opens', done: false, info: true },
      ];
  const taskItems = checklist.filter(c => !c.info);
  const completedCount = taskItems.filter(c => c.done).length;
  const progress = (completedCount / taskItems.length) * 100;

  return (
    <Box sx={{ minHeight: isDesktop ? 'auto' : 'calc(100dvh - 138px)', pb: 6 }}>
      <AppPageHero
        title={isSubscribed ? 'Preparing for Your Campaign' : 'Get Your Business Ready'}
        subtitle={isSubscribed
          ? "You're registered - your business goes live when the campaign opens"
          : 'A few quick steps to get your business live on Winnbell'}
      />

      <Container maxWidth='lg' sx={{ mt: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 3, alignItems: 'flex-start' }}>

          {/* Left: Draw info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ background: GRADIENT_HERO, p: 3, color: 'white' }}>
              <Typography variant='overline' sx={{ opacity: 0.8, letterSpacing: 1.5 }}>{isSubscribed ? 'Registered Campaign' : 'Upcoming Campaign'}</Typography>
              <Typography variant='h6' fontWeight={800} sx={{ mt: 0.5 }}>
                {subscription?.draw_name ?? 'Upcoming Monthly Campaign'}
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
                  Once the campaign is live, customers can submit receipts from your store through the Winnbell app to earn campaign entries. Members also receive one free entry per week regardless of any purchase.
                </Typography>
              </Box>
            </Box>
            </Paper>
          </motion.div>

          {/* Right: Preparation checklist (owners) or info (managers) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isManager ? (
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 3 }}>
                <Typography variant='h6' fontWeight={800} mb={0.5}>How it works at your location</Typography>
                <Typography variant='body2' color='text.secondary' mb={2.5}>
                  {isSubscribed
                    ? 'Your campaign is set up. Here is what to expect once it opens.'
                    : 'Your location goes live once the business owner activates a plan.'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {(isSubscribed
                    ? [
                        { title: 'Registered for the campaign', desc: `Your business is set for ${subscription?.draw_name ?? 'the upcoming campaign'}.` },
                        { title: 'Campaign opens', desc: 'When it goes live, customers can submit receipts from your location to enter.' },
                        { title: 'Entries appear here', desc: 'Every entry from your location shows up on this page to track.' },
                      ]
                    : [
                        { title: 'Owner activates a plan', desc: 'The business needs an active campaign plan to go live.' },
                        { title: 'Campaign opens', desc: 'Once live, customers can submit receipts from your location to enter.' },
                        { title: 'Entries appear here', desc: 'Every entry from your location shows up on this page to track.' },
                      ]
                  ).map((step, i, arr) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.75, position: 'relative', pb: i === arr.length - 1 ? 0 : 2.5 }}>
                      {/* Connector line */}
                      {i !== arr.length - 1 && (
                        <Box sx={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: '2px', bgcolor: 'divider' }} />
                      )}
                      {/* Numbered node */}
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: i === 0 && isSubscribed ? 'success.main' : 'primary.main',
                        color: 'white', fontWeight: 800, fontSize: 14,
                      }}>
                        {i + 1}
                      </Box>
                      <Box sx={{ pt: 0.25 }}>
                        <Typography variant='body2' fontWeight={700} color='text.primary'>{step.title}</Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5, display: 'block', mt: 0.25 }}>
                          {step.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='h6' fontWeight={800}>Preparation Checklist</Typography>
                <Chip label={`${completedCount}/${taskItems.length}`} size='small' color={completedCount === taskItems.length ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
              </Box>
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{ mb: 3, height: 6, borderRadius: 2, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
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
                <strong>Entry generation opens when the campaign starts.</strong> In the meantime, make sure your profile is complete so customers can find you on the map and know what you offer.
              </Typography>
              </Paper>
            )}
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default DrawPreparationView;
