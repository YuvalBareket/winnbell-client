import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { BUSINESS_SECTORS } from '../../data';
import { BG_PAGE } from '../../../../shared/colors';
import { useAdminBusinesses } from '../../hooks/useAdmin';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import BusinessDetailDrawer from './BusinessDetailDrawer';

interface Props {
  isMobile: boolean;
  onCreateBusiness: () => void;
}

const SUB_COLOR: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  Active: { label: 'Active', color: 'success' },
  Trialing: { label: 'Trial', color: 'warning' },
  Past_Due: { label: 'Past Due', color: 'error' },
  Cancelled: { label: 'Cancelled', color: 'error' },
  Incomplete: { label: 'Incomplete', color: 'default' },
};

const BusinessesTab: React.FC<Props> = ({ isMobile, onCreateBusiness }) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useAdminBusinesses({
    page: page + 1,
    limit: 25,
    search: debouncedSearch,
  });

  const businesses = data?.rows ?? [];
  const total = data?.total ?? 0;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  }, []);

  const subChip = (status: string | null) => {
    if (!status) return <Chip label='None' size='small' />;
    const cfg = SUB_COLOR[status] ?? { label: status, color: 'default' as const };
    return <Chip label={cfg.label} color={cfg.color} size='small' />;
  };

  return (
    <>
    <Stack spacing={3}>
      <Box display='flex' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={1}>
        <TextField
          size='small'
          placeholder='Search name or owner…'
          value={search}
          onChange={handleSearch}
          InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' /></InputAdornment> }}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />
        <Button variant='contained' startIcon={<AddIcon />} onClick={onCreateBusiness}>
          New Business
        </Button>
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant='rounded' height={90} />)
            : businesses.map((biz) => {
                const sectorData = BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];
                return (
                  <Card key={biz.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', cursor: 'pointer' }} onClick={() => setSelectedBizId(biz.id)}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {sectorData && (
                            <Box
                              sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 40, height: 40, borderRadius: 1,
                                backgroundColor: sectorData.bgColor, color: sectorData.color,
                              }}
                            >
                              {sectorData.icon}
                            </Box>
                          )}
                          <Box flex={1} minWidth={0}>
                            <Typography variant='subtitle2' fontWeight={700} noWrap>{biz.name}</Typography>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {biz.owner_name ?? biz.owner_email ?? '—'}
                            </Typography>
                          </Box>
                          {subChip(biz.subscription_status)}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box>
                            <Typography variant='h6' fontWeight={800}>{biz.total_activated}</Typography>
                            <Typography variant='caption' color='text.secondary'>entries</Typography>
                          </Box>
                          <Box>
                            <Typography variant='h6' fontWeight={800}>{biz.location_count}</Typography>
                            <Typography variant='caption' color='text.secondary'>locations</Typography>
                          </Box>
                          {biz.entry_cap && (
                            <Box>
                              <Typography variant='h6' fontWeight={800}>{biz.entry_cap}</Typography>
                              <Typography variant='caption' color='text.secondary'>cap</Typography>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
        </Stack>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: BG_PAGE }}>
                <TableCell>Business</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Sector</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell align='center'>Locations</TableCell>
                <TableCell align='center'>Entries</TableCell>
                <TableCell align='center'>Cap</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : businesses.map((biz) => {
                    const sectorData = BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];
                    return (
                      <TableRow key={biz.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedBizId(biz.id)}>
                        <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                          <Typography variant='body2' fontWeight={600} noWrap>{biz.name}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant='body2' noWrap>{biz.owner_name ?? '—'}</Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>{biz.owner_email ?? ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={sectorData?.icon as any}
                            label={sectorData?.label || biz.sector}
                            size='small'
                            variant='filled'
                            sx={{ backgroundColor: sectorData?.bgColor, color: sectorData?.color, fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>{subChip(biz.subscription_status)}</TableCell>
                        <TableCell align='center'>{biz.location_count}</TableCell>
                        <TableCell align='center' sx={{ fontWeight: 700 }}>{biz.total_activated}</TableCell>
                        <TableCell align='center' sx={{ color: 'text.secondary' }}>
                          {biz.entry_cap ?? '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              {!isLoading && businesses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                    No businesses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component='div'
            count={total}
            page={page}
            rowsPerPage={25}
            rowsPerPageOptions={[25]}
            onPageChange={(_e, newPage) => setPage(newPage)}
          />
        </TableContainer>
      )}
    </Stack>

    <BusinessDetailDrawer businessId={selectedBizId} onClose={() => setSelectedBizId(null)} />
    </>
  );
};

export default BusinessesTab;
