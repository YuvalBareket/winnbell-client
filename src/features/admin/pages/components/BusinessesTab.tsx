import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  LinearProgress,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BUSINESS_SECTORS } from '../../data';
import { BG_PAGE } from '../../../../shared/colors';

interface Props {
  businesses: any[] | undefined;
  isMobile: boolean;
  onCreateBusiness: () => void;
  onGenerateEntries: (id: number) => void;
}

const BusinessesTab: React.FC<Props> = ({ businesses, isMobile, onCreateBusiness, onGenerateEntries }) => {
  return (
    <Stack spacing={3}>
      <Box display='flex' justifyContent='flex-end'>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={onCreateBusiness}
        >
          New Business
        </Button>
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {businesses?.map((biz) => {
            const activationRate =
              biz.total_tickets_created > 0
                ? (biz.total_activated / biz.total_tickets_created) * 100
                : 0;
            const sectorData =
              BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];

            return (
              <Card
                key={biz.id}
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      {sectorData && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: sectorData.bgColor,
                            color: sectorData.color,
                          }}
                        >
                          {sectorData.icon}
                        </Box>
                      )}
                      <Box flex={1}>
                        <Typography variant='subtitle2' fontWeight={700}>
                          {biz.name}
                        </Typography>
                        <Chip
                          label={sectorData?.label || biz.sector}
                          size='small'
                          variant='outlined'
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant='body2' fontWeight={500}>
                          Activation Rate
                        </Typography>
                        <Typography variant='body2' fontWeight={500}>
                          {Math.round(activationRate)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={activationRate}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          backgroundColor:
                            activationRate > 60
                              ? '#c8e6c9'
                              : activationRate > 30
                              ? '#ffe0b2'
                              : '#ffcdd2',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor:
                              activationRate > 60
                                ? '#2e7d32'
                                : activationRate > 30
                                ? '#f57c00'
                                : '#c62828',
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                        >
                          Total Created
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {biz.total_tickets_created}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                        >
                          Activated
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {biz.total_activated}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant='outlined'
                      size='small'
                      onClick={() => onGenerateEntries(biz.id)}
                    >
                      Generate Entries
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: BG_PAGE }}>
                <TableCell>Name</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell align='center'>Total Created</TableCell>
                <TableCell align='center'>Activated</TableCell>
                <TableCell>Activation Rate</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {businesses?.map((biz) => {
                const activationRate =
                  biz.total_tickets_created > 0
                    ? (biz.total_activated / biz.total_tickets_created) * 100
                    : 0;
                const sectorData =
                  BUSINESS_SECTORS[
                    biz.sector as keyof typeof BUSINESS_SECTORS
                  ];

                return (
                  <TableRow key={biz.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{biz.name}</TableCell>
                    <TableCell>
                      <Chip
                        icon={sectorData?.icon as any}
                        label={sectorData?.label || biz.sector}
                        size='small'
                        variant='filled'
                        sx={{
                          backgroundColor: sectorData?.bgColor,
                          color: sectorData?.color,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align='center'>
                      {biz.total_tickets_created}
                    </TableCell>
                    <TableCell align='center'>
                      {biz.total_activated}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 150 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant='caption' fontWeight={500}>
                            {Math.round(activationRate)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={activationRate}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            backgroundColor:
                              activationRate > 60
                                ? '#c8e6c9'
                                : activationRate > 30
                                ? '#ffe0b2'
                                : '#ffcdd2',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                activationRate > 60
                                  ? '#2e7d32'
                                  : activationRate > 30
                                  ? '#f57c00'
                                  : '#c62828',
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => onGenerateEntries(biz.id)}
                      >
                        Generate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};

export default BusinessesTab;
