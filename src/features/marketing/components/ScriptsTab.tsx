import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, Chip,
} from '@mui/material';
import {
  ContentCopy, RecordVoiceOverOutlined,
} from '@mui/icons-material';
import {
  PRIMARY_MAIN,
} from '../../../shared/colors';

interface ScriptsTabProps {
  onToast: (msg: string) => void;
}

// Lawyer-approved staff scripts (supersedes the earlier deferred version). Bracketed tokens
// [amount]/[prize]/[product]/[number] are placeholders staff fill in at the register.
// 2026-08-22: "this month's draw" -> "the current draw" (campaigns are no longer strictly
// monthly - the September trial runs 3 months); cadence wording only, flag to the lawyer
// with the other trial-era rules updates.
const SCRIPTS = [
  { label: 'Near the threshold', text: 'You\'re only $[amount] away from qualifying for a Winnbell entry. Would you like to add anything so you can enter the current draw for a chance to win $[prize]?' },
  { label: 'Suggest an add-on', text: 'If you add [product], your purchase will reach the Winnbell threshold, and you can enter the current draw for a chance to win $[prize]. Would you like to add one?' },
  { label: 'New to Winnbell', text: 'Have you tried Winnbell yet? Today\'s purchase may qualify you to enter the current draw for a chance to win $[prize]. Just scan the QR code and submit your receipt. It takes seconds.' },
  { label: 'Complete the entry', text: 'Your purchase may qualify for [number] Winnbell entry/entries. Just scan the QR code and submit your receipt now. It takes seconds, and you\'ll be in the draw for a chance to win $[prize].' },
];

const ScriptsTab = ({
  onToast,
}: ScriptsTabProps) => {
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast('Script copied to clipboard!');
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Box sx={{ pb: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={800} gutterBottom>Staff Boost</Typography>
              <Typography variant='body2' color='text.secondary'>Turn every checkout into an entry.</Typography>
            </Box>

            {/* Why it matters callout */}
            <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: `${PRIMARY_MAIN}08`, border: `1px solid ${PRIMARY_MAIN}20`, p: 2.5 }}>
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                <RecordVoiceOverOutlined sx={{ color: PRIMARY_MAIN, fontSize: 24, flexShrink: 0, mt: 0.5 }} />
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={800}>
                    Your team can turn a quick mention into customer action.
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                    The best time to mention Winnbell is before payment, while the customer can still adjust the order. Research shows that staff prompts increase the likelihood customers notice an offer and act on it. Tell them exactly how close they are to qualifying, suggest a relevant add-on, and make the next step feel effortless.
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Scripts - full width, two columns on desktop */}
            <Box>
              <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Scripts your team can use
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {SCRIPTS.map((script, idx) => (
                  <Paper key={idx} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2 }}>
                    <Stack spacing={1.5} sx={{ height: '100%' }}>
                      <Chip
                        label={script.label}
                        size='small'
                        variant='outlined'
                        sx={{ width: 'fit-content', fontSize: '0.75rem', fontWeight: 700 }}
                      />
                      <Typography variant='body2' sx={{ fontStyle: 'italic', lineHeight: 1.6, color: 'text.primary', flex: 1 }}>
                        "{script.text}"
                      </Typography>
                      <Button
                        fullWidth
                        variant='outlined'
                        size='small'
                        startIcon={<ContentCopy fontSize='small' />}
                        onClick={() => handleCopyText(script.text)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Copy
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Box>

          </Stack>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default ScriptsTab;
