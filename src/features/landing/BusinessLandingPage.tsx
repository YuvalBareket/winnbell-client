import { useEffect } from 'react';
import { Box, Typography, Button, Stack, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import AttractButton from '../../shared/components/AttractButton';
import { useNavigate } from 'react-router-dom';
import {
  ArrowForward, ExpandMore,
  TravelExploreRounded, QrCodeScannerRounded, ConfirmationNumberRounded, AutoAwesomeRounded,
  TrendingUpRounded, AutorenewRounded, TrackChangesRounded, SavingsRounded, CampaignRounded,
  PsychologyRounded, PaidRounded, BoltRounded, InsightsRounded, DesignServicesRounded,
} from '@mui/icons-material';

// "How it works" steps - numbered 01-04 to match the user landing design
const BUSINESS_STEPS = [
  { num: '01', title: 'Create your account', body: 'Register your business in a minute.' },
  { num: '02', title: 'Set up your profile', body: 'Add your name, logo, and locations so customers can discover you.' },
  { num: '03', title: 'Subscribe', body: 'Pick the plan that fits you.' },
  { num: '04', title: 'Prepare for the campaign', body: 'Look through our guide and get ready for the upcoming campaign.' },
];
import { motion } from 'framer-motion';
import LandingNavbar from './components/LandingNavbar';
import LandingFooter from './components/LandingFooter';
import BusinessHeroShowcase from './components/BusinessHeroShowcase';
import {
  GRADIENT_HERO_WARM,
  PRIMARY_MAIN,
  TEXT_HEADING,
  TEXT_SECONDARY,
  BG_SUBTLE,
  BORDER_LIGHT,
} from '../../shared/colors';

const BusinessLandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowX: 'clip', zoom: { xs: 0.9, md: 1 } }}>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: GRADIENT_HERO_WARM,
          pt: 0,
          pb: { xs: 10, md: 16 },
          px: { xs: 2.5, md: 0 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: '-20%', right: '-5%', width: 480, height: 480, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 360, height: 360, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <LandingNavbar onNavigate={navigate} variant='business' />

        <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1, pt: { xs: 5, md: 5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
              gap: { xs: 0, md: 8 },
              alignItems: 'center',
              maxWidth: { xs: 600, md: 'none' },
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                textAlign: { xs: 'center', md: 'left' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Typography
                  variant='h1'
                  sx={{
                    fontWeight: 900,
                    // Matches the user LandingHero headline sizing so the two heroes feel like one family.
                    fontSize: { xs: 'min(2.6rem, 8.4vw - 3px)', sm: '2.6rem', md: 'min(3.4rem, 7.6vw - 38px)' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: 'white',
                    mx: { xs: -2, sm: 0 },
                    mb: { xs: 2, md: 3 },
                  }}
                >
                  Run big-brand sweepstakes on a small-business budget.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: { xs: '0.9rem', md: '1.15rem' },
                    lineHeight: 1.6,
                    mb: { xs: 3, md: 5 },
                    maxWidth: 560,
                    mx: { xs: 'auto', md: 0 },
                    fontWeight: 400,
                  }}
                >
                  Winnbell lets small businesses share one major cash-prize campaign, without having to fund or manage one themselves. We handle the prize, the rules, and the winner. You take the credit.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ width: '100%' }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.5, md: 2 }}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  alignItems='center'
                  sx={{ mb: { xs: 4, md: 0 } }}
                >
                  <AttractButton onLightBackground
                    variant='contained'
                    size='large'
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register/Business')}
                    sx={{
                      bgcolor: 'white',
                      color: PRIMARY_MAIN,
                      fontWeight: 700,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      px: { xs: 2.5, sm: 4 },
                      py: { xs: 1.4, md: 1.6 },
                      width: { xs: '100%', sm: 'auto' },
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' },
                    }}
                  >
                    Join the Campaign
                  </AttractButton>
                  <Button
                    variant='text'
                    endIcon={<ArrowForward sx={{ fontSize: '1rem !important' }} />}
                    onClick={() => navigate('/')}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                      fontSize: { xs: '0.85rem', md: '0.9rem' },
                      opacity: 0.9,
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': { bgcolor: 'transparent', opacity: 1, color: 'white' },
                      textTransform: 'none',
                    }}
                  >
                    I'm a shopper, not a business owner
                  </Button>
                </Stack>
              </motion.div>
            </Box>

            {/* The five-beat owner story loop */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ justifySelf: 'center' }}
            >
              <BusinessHeroShowcase />
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* ── 2. How Winnbell Works ──────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
        <Container maxWidth='lg'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 2, md: 3 }, textAlign: 'center' }}>
              How Winnbell Works
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '0.95rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: 640, mx: 'auto', mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
              One campaign at a time. One randomly selected winner. Minimal effort on your side. Winnbell operates and administers the whole thing, and your customers earn entries through qualifying purchases at your business.
            </Typography>
          </motion.div>

          <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_HEADING, fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 600, mb: { xs: 3, md: 4 } }}>
              Quick sign up:
            </Typography>

            {/* Steps - same design language as the user landing HowItWorks section:
                numbered tiles + dashed connector on desktop, vertical timeline on mobile. */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, position: 'relative', alignItems: 'flex-start', justifyContent: 'center', mb: { md: 6 }, textAlign: 'center' }}>
              <Box sx={{ position: 'absolute', top: 32, left: '12%', right: '12%', height: 0, borderTop: '2px dashed rgba(25,93,230,0.2)', zIndex: 0 }} />
              {BUSINESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ flex: 1, maxWidth: 260 }}
                >
                  <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1, px: 1, mt: i % 2 === 1 ? 5 : 0 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: PRIMARY_MAIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', mx: 'auto', mb: 2.5, boxShadow: '0 8px 24px rgba(25,93,230,0.3)' }}>
                      {step.num}
                    </Box>
                    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, minHeight: 128 }}>
                      <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1, fontSize: '1rem' }}>{step.title}</Typography>
                      <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.7 }}>{step.body}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>

            {/* Mobile timeline */}
            <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, textAlign: 'left' }}>
              {BUSINESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: PRIMARY_MAIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0, boxShadow: '0 6px 18px rgba(25,93,230,0.3)' }}>
                        {step.num}
                      </Box>
                      {i < BUSINESS_STEPS.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, bgcolor: 'rgba(25,93,230,0.12)', mt: 0.75, minHeight: 16 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 0.5 }}>
                      <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 0.5, fontSize: '0.95rem' }}>{step.title}</Typography>
                      <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, fontSize: '0.875rem' }}>{step.body}</Typography>
                    </Box>
                  </Stack>
                </motion.div>
              ))}
            </Stack>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Box sx={{ bgcolor: BG_SUBTLE, borderRadius: 2, p: { xs: 2.5, md: 3.5 }, textAlign: 'center' }}>
              <Typography sx={{ color: TEXT_HEADING, fontWeight: 600, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                That's it. You're set for the upcoming campaign.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── 3. Your Customer's Experience ──────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, bgcolor: BG_SUBTLE }}>
        <Container maxWidth='lg'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
              Your Customer's Experience
            </Typography>
          </motion.div>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 3, md: 4 } }}>
            {[
              { Icon: TravelExploreRounded, title: 'They find you', desc: 'New faces discover you on the Winnbell map. Regulars get a reason to round up their purchase.' },
              { Icon: QrCodeScannerRounded, title: 'They scan', desc: 'One QR at checkout. Receipt in, less than 30 seconds.' },
              { Icon: ConfirmationNumberRounded, title: "They're in the draw", desc: 'Every qualified receipt earns entries into the current cash prize draw.' },
              { Icon: AutoAwesomeRounded, title: 'They come back', desc: 'They link the excitement of the draw with your business, and keep coming back.' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              >
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: { xs: 2, md: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    p: { xs: 2.5, md: 3.5 },
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: '0 8px 24px rgba(21,101,192,0.12)', borderColor: PRIMARY_MAIN },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 64, md: 76 },
                      height: { xs: 64, md: 76 },
                      borderRadius: 3,
                      bgcolor: `${PRIMARY_MAIN}0d`,
                      color: PRIMARY_MAIN,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: { xs: 2, md: 2.5 },
                    }}
                  >
                    <card.Icon sx={{ fontSize: { xs: 32, md: 38 } }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: TEXT_HEADING, mb: { xs: 1, md: 1.5 }, fontSize: { xs: '1.05rem', md: '1.2rem' } }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
                    {card.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── 4. Benefits Accordions ────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
        <Container maxWidth='md'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
              More than a marketing tool.
            </Typography>
          </motion.div>

          <Stack spacing={1.5}>
            {[
              { Icon: TrendingUpRounded, title: 'Encourage larger purchases', detail: 'A qualifying spend threshold gives customers a concrete reason to add one more item and reach it. Small nudges like that can add up across your transactions.' },
              { Icon: AutorenewRounded, title: 'Encourage repeat visits', detail: 'A live campaign is one more reason for customers to come back. Each qualifying visit is another opportunity to earn entries into the current prize draw.' },
              { Icon: TrackChangesRounded, title: 'Stand out from competitors', detail: 'Offer an experience most competing businesses simply don\'t have. Winnbell turns an ordinary purchase into something memorable, and memorable businesses get chosen.' },
              { Icon: SavingsRounded, title: 'No prize costs or campaign administration', detail: 'Winnbell sponsors the prize, operates the campaign, validates entries, selects the winner, and manages everything end to end. You stay focused on running your business.' },
              { Icon: CampaignRounded, title: 'Marketing platform, not just a promotion', detail: 'Your business is listed and discoverable on the Winnbell platform, putting you in front of users who are actively looking for places to earn entries.' },
              { Icon: PsychologyRounded, title: 'Tested marketing approach', detail: 'Prize promotions have been a staple of big-brand marketing for decades. Winnbell brings that same approach within reach of businesses of every size.' },
              { Icon: PaidRounded, title: 'Built to be affordable', detail: 'Our shared campaign model spreads the cost of a professionally managed prize promotion, keeping it affordable for businesses of every size.' },
              { Icon: BoltRounded, title: 'Ready in under 10 minutes', detail: 'Create your account, set up your business, and join your first campaign in minutes. No technical knowledge, no complicated onboarding.' },
              { Icon: InsightsRounded, title: 'Track what matters', detail: 'Follow campaign performance, customer activity, and business trends from your dashboard, and make marketing decisions backed by real data.' },
              { Icon: DesignServicesRounded, title: 'Everything you need to succeed', detail: 'QR posters, window stickers, social media assets, and practical guides. Everything you need to promote your participation is ready to download.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.05 }}
              >
                <Accordion
                  sx={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${BORDER_LIGHT}`,
                    borderRadius: 1.5,
                    '&.Mui-expanded': { boxShadow: '0 2px 8px rgba(21,101,192,0.08)' },
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />} sx={{ py: { xs: 1.5, md: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <item.Icon sx={{ fontSize: 22, color: PRIMARY_MAIN, flexShrink: 0 }} />
                      <Typography sx={{ fontWeight: 600, color: TEXT_HEADING, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                        {item.title}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: 'rgba(21,101,192,0.02)', borderTop: `1px solid ${BORDER_LIGHT}`, py: { xs: 2, md: 2.5 } }}>
                    <Typography sx={{ color: TEXT_SECONDARY, lineHeight: 1.7, fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
                      {item.detail}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── 5. Credibility Band ────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, background: GRADIENT_HERO_WARM, color: 'white', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <Box sx={{ position: 'absolute', top: '-15%', right: '-10%', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7, mb: { xs: 4, md: 6 } }}>
              The biggest brands have run prize promotions for decades. Winnbell makes the same strategy simple, affordable, and fully managed.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Typography variant='h2' sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', md: '2.4rem' }, lineHeight: 1.2, mb: { xs: 4, md: 6 } }}>
              It's your turn. Bring enterprise-level marketing to your business.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <AttractButton onLightBackground
              variant='contained'
              size='large'
              onClick={() => navigate('/register/Business')}
              sx={{
                bgcolor: 'white',
                color: PRIMARY_MAIN,
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1rem' },
                px: { xs: 2.5, md: 5 },
                py: { xs: 1.4, md: 1.6 },
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' },
              }}
            >
              Create a business account
            </AttractButton>
          </motion.div>
        </Container>
      </Box>

      {/* ── 6. FAQ Accordions ──────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
        <Container maxWidth='md'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
              Frequently Asked Questions
            </Typography>
          </motion.div>

          <Stack spacing={1.5}>
            {[
              { q: 'Do I have to provide or pay for the prize?', a: 'No. Winnbell sponsors the prize and operates the campaign.' },
              { q: 'Does my business run the campaign?', a: 'No. Winnbell administers the campaign, validates entries, selects the winner at random, and awards the prize. Your role is simply to give eligible customers the opportunity to earn entries.' },
              { q: 'Can customers enter without making a purchase?', a: 'Yes. Every Winnbell campaign includes an alternative method of entry with no purchase required, in accordance with the Official Rules.' },
              { q: 'How do customers receive entries?', a: 'Customers who make a qualifying purchase scan your Winnbell QR code and submit their receipt through the platform, in under 30 seconds. Winnbell also provides all users with weekly entries.' },
              { q: 'How much work is required from my staff?', a: 'Very little. Once you are set up, a brief mention at checkout is all it takes to lift engagement. Winnbell handles everything else.' },
              { q: 'Why wouldn\'t I just run my own prize promotion?', a: 'A legally compliant prize promotion requires campaign planning, official rules, entry management, winner selection, prize administration, legal work, prize sponsorship, and ongoing oversight. Winnbell packages all of it into one professionally managed platform, so businesses of any size can offer this kind of customer excitement without the traditional cost and complexity.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.05 }}
              >
                <Accordion
                  sx={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${BORDER_LIGHT}`,
                    borderRadius: 1.5,
                    '&.Mui-expanded': { boxShadow: '0 2px 8px rgba(21,101,192,0.08)' },
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />} sx={{ py: { xs: 1.5, md: 2 } }}>
                    <Typography sx={{ fontWeight: 600, color: TEXT_HEADING, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                      {item.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: 'rgba(21,101,192,0.02)', borderTop: `1px solid ${BORDER_LIGHT}`, py: { xs: 2, md: 2.5 } }}>
                    <Typography sx={{ color: TEXT_SECONDARY, lineHeight: 1.7, fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}

            {/* Last FAQ with defaultExpanded and CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.45 }}
            >
              <Accordion
                defaultExpanded
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${BORDER_LIGHT}`,
                  borderRadius: 1.5,
                  '&.Mui-expanded': { boxShadow: '0 2px 8px rgba(21,101,192,0.08)' },
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ py: { xs: 1.5, md: 2 } }}>
                  <Typography sx={{ fontWeight: 600, color: TEXT_HEADING, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                    How do I start?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'rgba(21,101,192,0.02)', borderTop: `1px solid ${BORDER_LIGHT}`, py: { xs: 2, md: 2.5 } }}>
                  <Box>
                    <Typography sx={{ color: TEXT_SECONDARY, lineHeight: 1.7, fontSize: { xs: '0.9rem', md: '0.95rem' }, mb: { xs: 2.5, md: 3 } }}>
                      Create your business account, join the campaigns, set up your profile, and choose your qualifying purchase amount. Most businesses are live in the next campaign within 10 minutes.
                    </Typography>
                    <AttractButton
                      variant='contained'
                      size='medium'
                      onClick={() => navigate('/register/Business')}
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                        px: { xs: 2, md: 3.5 },
                        py: { xs: 1.1, md: 1.3 },
                      }}
                    >
                      Become a partner
                    </AttractButton>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      <LandingFooter onNavigate={navigate} />
    </Box>
  );
};

export default BusinessLandingPage;
