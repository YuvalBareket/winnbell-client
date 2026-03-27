import { Box } from '@mui/material';
import { ActiveTicketsList } from '../components/ActiveTicketsList';
import { DrawSwiper } from '../../draw/components/DrawSwiper';
import { useState } from 'react';

const MyTicketsPage = () => {
  const [activeDrawId, setActiveDrawId] = useState<number | null>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ pt: 0 }}>
        {/* Component 1: The Draw Header */}
        <DrawSwiper
          draw_id={activeDrawId}
          onDrawChange={(id) => setActiveDrawId(id)}
        />
        {/* Component 2: The Ticket List */}
        <ActiveTicketsList draw_id={activeDrawId} />
      </Box>
    </Box>
  );
};

export default MyTicketsPage;
