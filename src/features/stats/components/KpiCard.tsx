import { Paper, Box, Typography } from '@mui/material';

const KpiCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <Paper elevation={0} sx={{ flex: 1, p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant='h5' fontWeight={800} lineHeight={1.2}>{value}</Typography>
    </Box>
  </Paper>
);

export default KpiCard;
