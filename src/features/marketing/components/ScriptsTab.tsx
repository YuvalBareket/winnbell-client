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

const SCRIPTS = [
  { label: 'At checkout', text: 'By the way, we\'re on Winnbell. Scan this code, submit your receipt, and you\'re in this month\'s prize draw. It takes seconds.' },
  { label: 'New to Winnbell', text: 'Have you tried Winnbell? Join through our code and you\'re in this month\'s draw.' },
  { label: 'Regulars', text: 'Don\'t forget to submit your receipt for this month\'s Winnbell draw. Scan our code and it opens ready to go.' },
  { label: 'Already a member', text: 'Already on Winnbell? Our code is the fastest way in. It takes you straight to receipt submission with our store already selected.' },
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
                    Your team is your best marketing.
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                    A five-second mention at the register is the single biggest driver of scans, far more than any sign. The shops that grow fastest on Winnbell are the ones whose team asks on every order. It costs nothing and takes seconds.
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
