import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Container,
  LinearProgress,
  Box,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAdminBusinesses, useAllDraws } from '../hooks/useAdmin';
import CreateBusinessModal from './components/CreateBusinessModal';
import CreateDrawModal from './components/CreateDrawModal';
import GenerateTicketsModal from './components/GenerateTicketsModal';

const BusinessDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Queries
  const { data: businesses, isLoading: loadingBiz } = useAdminBusinesses();
  const { data: draws, isLoading: loadingDraws } = useAllDraws();

  // Modal States
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null,
  );
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  if (loadingBiz || loadingDraws) return <LinearProgress sx={{ mt: 5 }} />;

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Typography variant='h4' fontWeight='bold' mb={3}>
        Admin Control Center
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label='Businesses' />
          <Tab label='Raffle Draws' />
        </Tabs>
      </Box>

      {/* --- TAB 0: BUSINESSES --- */}
      {tabValue === 0 && (
        <>
          <Box display='flex' justifyContent='flex-end' mb={2}>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setIsBizModalOpen(true)}
            >
              New Business
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell align='center'>
                    <strong>Total Created</strong>
                  </TableCell>
                  <TableCell align='center'>
                    <strong>Activated</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Usage %</strong>
                  </TableCell>
                  <TableCell align='right'>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {businesses?.map((b) => {
                  const usage =
                    b.total_tickets_created > 0
                      ? (b.total_activated / b.total_tickets_created) * 100
                      : 0;
                  return (
                    <TableRow key={b.id} hover>
                      <TableCell>{b.name}</TableCell>
                      <TableCell align='center'>
                        {b.total_tickets_created}
                      </TableCell>
                      <TableCell align='center'>{b.total_activated}</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <LinearProgress variant='determinate' value={usage} />
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => setSelectedBusinessId(b.id)}
                        >
                          Generate Tickets
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* --- TAB 1: DRAWS --- */}
      {tabValue === 1 && (
        <>
          <Box display='flex' justifyContent='flex-end' mb={2}>
            <Button
              variant='contained'
              color='secondary'
              startIcon={<AddIcon />}
              onClick={() => setIsDrawModalOpen(true)}
            >
              New Draw
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <strong>Draw Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Prize</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {draws?.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.prize_name}</TableCell>
                    <TableCell>
                      {new Date(d.draw_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{d.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Modals */}
      <CreateBusinessModal
        open={isBizModalOpen}
        onClose={() => setIsBizModalOpen(false)}
      />
      <CreateDrawModal
        open={isDrawModalOpen}
        onClose={() => setIsDrawModalOpen(false)}
      />
      <GenerateTicketsModal
        open={!!selectedBusinessId}
        onClose={() => setSelectedBusinessId(null)}
        businessId={selectedBusinessId}
      />
    </Container>
  );
};

export default BusinessDashboard;
