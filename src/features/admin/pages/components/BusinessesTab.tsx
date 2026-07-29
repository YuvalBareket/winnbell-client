import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  InputAdornment,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BUSINESS_SECTORS } from '../../data';
import {
  PRIMARY_MAIN, PRIMARY_TINT, BG_ROW_SUBTLE, TEXT_TERTIARY, TEXT_HEADING,
  BORDER_SUBTLE, STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT, STATUS_PENDING_BG, STATUS_PENDING_TEXT,
  METRIC_BAD_TINT, METRIC_BAD,
} from '../../../../shared/colors';
import { riseIn } from '../../../../shared/motion';
import { AdminCard } from './adminUi';
import { useAdminBusinesses } from '../../hooks/useAdmin';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import BusinessDetailDrawer from './BusinessDetailDrawer';

interface Props {
  isMobile: boolean;
}

const SUB_COLOR: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  Active: { label: 'Active', color: 'success' },
  Trialing: { label: 'Trial', color: 'warning' },
  Past_Due: { label: 'Past Due', color: 'error' },
  Cancelled: { label: 'Cancelled', color: 'error' },
  Incomplete: { label: 'Incomplete', color: 'default' },
};

const LIMIT = 25;

const BusinessesTab: React.FC<Props> = ({ isMobile }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminBusinesses({ limit: LIMIT, search: debouncedSearch });

  // Infinite scroll for mobile: observe sentinel element
  useEffect(() => {
    if (!isMobile) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // For desktop: fetch the target page if it hasn't been loaded yet
  const handlePageChange = useCallback(
    (_e: unknown, newPage: number) => {
      setPage(newPage);
      const pagesLoaded = data?.pages.length ?? 0;
      if (newPage + 1 > pagesLoaded && hasNextPage) {
        fetchNextPage();
      }
    },
    [data?.pages.length, hasNextPage, fetchNextPage],
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  }, []);

  const subChip = (status: string | null) => {
    if (!status) return (
      <Chip
        label='None'
        size='small'
        sx={{
          bgcolor: METRIC_BAD_TINT,
          color: METRIC_BAD,
          fontWeight: 700,
          borderRadius: '8px',
        }}
      />
    );
    let bgColor = METRIC_BAD_TINT;
    let textColor = METRIC_BAD;
    if (status === 'Active') {
      bgColor = STATUS_ACTIVATED_BG;
      textColor = STATUS_ACTIVATED_TEXT;
    } else if (status === 'Trialing') {
      bgColor = STATUS_PENDING_BG;
      textColor = STATUS_PENDING_TEXT;
    }
    const cfg = SUB_COLOR[status] ?? { label: status, color: 'default' as const };
    return (
      <Chip
        label={cfg.label}
        size='small'
        sx={{
          bgcolor: bgColor,
          color: textColor,
          fontWeight: 700,
          borderRadius: '8px',
        }}
      />
    );
  };

  // Desktop: show only the current page's rows
  const desktopRows = data?.pages[page]?.rows ?? [];
  const total = data?.pages[0]?.total ?? 0;

  // Mobile: accumulate all fetched rows
  const mobileRows = data?.pages.flatMap((p) => p.rows) ?? [];

  return (
    <motion.div initial='hidden' animate='visible' variants={riseIn}>
    <Stack spacing={3}>
      <Box display='flex' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={1}>
        <TextField
          size='small'
          placeholder='Search name or owner...'
          value={search}
          onChange={handleSearch}
          InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' /></InputAdornment> }}
          sx={{
            width: { xs: '100%', sm: 280 },
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          }}
        />
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant='rounded' height={90} />)
            : mobileRows.map((biz) => {
                const sectorData = BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];
                return (
                  <motion.div key={biz.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => setSelectedBizId(biz.id)}>
                      <AdminCard sx={{ cursor: 'pointer' }} hover>
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 40, height: 40, borderRadius: '12px',
                                  bgcolor: PRIMARY_TINT, color: PRIMARY_MAIN,
                                }}
                              >
                                {sectorData?.icon || <StorefrontIcon />}
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography variant='subtitle2' fontWeight={800} noWrap sx={{ color: TEXT_HEADING }}>{biz.name}</Typography>
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap>
                                  {biz.owner_name ?? biz.owner_email ?? '—'}
                                </Typography>
                              </Box>
                              <Tooltip title='View dashboard'>
                                <IconButton
                                  size='small'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/businesses/${biz.id}/view`);
                                  }}
                                  sx={{ color: PRIMARY_MAIN }}
                                >
                                  <OpenInNewIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                              {subChip(biz.subscription_status)}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box>
                                <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING }}>{biz.total_activated}</Typography>
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>entries</Typography>
                              </Box>
                              <Box>
                                <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING }}>{biz.location_count}</Typography>
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>locations</Typography>
                              </Box>
                              {biz.entry_cap && (
                                <Box>
                                  <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING }}>{biz.entry_cap}</Typography>
                                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>cap</Typography>
                                </Box>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </AdminCard>
                    </Box>
                  </motion.div>
                );
              })}
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={`more-${i}`} variant='rounded' height={90} />)}
          <div ref={sentinelRef} />
        </Stack>
      ) : (
        <AdminCard sx={{ overflow: 'hidden' }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: BG_ROW_SUBTLE }}>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Business</TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Sector</TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Subscription</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Locations</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Entries</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Cap</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: BG_ROW_SUBTLE } }}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : desktopRows.map((biz, idx) => {
                    const sectorData = BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];
                    return (
                      <TableRow
                        key={biz.id}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: BG_ROW_SUBTLE },
                          borderBottom: idx < desktopRows.length - 1 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                        }}
                        onClick={() => setSelectedBizId(biz.id)}
                      >
                        <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '12px', bgcolor: PRIMARY_TINT, color: PRIMARY_MAIN }}>
                              {sectorData?.icon || <StorefrontIcon sx={{ fontSize: 20 }} />}
                            </Box>
                            <Typography variant='body2' fontWeight={600} noWrap>{biz.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Typography variant='body2' noWrap>{biz.owner_name ?? '—'}</Typography>
                          <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap>{biz.owner_email ?? ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={sectorData?.icon as any}
                            label={sectorData?.label || biz.sector}
                            size='small'
                            sx={{ bgcolor: sectorData?.bgColor, color: sectorData?.color, fontWeight: 500, borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>{subChip(biz.subscription_status)}</TableCell>
                        <TableCell align='center'>{biz.location_count}</TableCell>
                        <TableCell align='center' sx={{ fontWeight: 700, color: TEXT_HEADING }}>{biz.total_activated}</TableCell>
                        <TableCell align='center' sx={{ color: TEXT_TERTIARY }}>
                          {biz.entry_cap ?? '—'}
                        </TableCell>
                        <TableCell align='center'>
                          <Tooltip title='View dashboard'>
                            <IconButton
                              size='small'
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/businesses/${biz.id}/view`);
                              }}
                              sx={{ color: PRIMARY_MAIN }}
                            >
                              <OpenInNewIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              {!isLoading && desktopRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 4, color: TEXT_TERTIARY }}>
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
            rowsPerPage={LIMIT}
            rowsPerPageOptions={[LIMIT]}
            onPageChange={handlePageChange}
            sx={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}
          />
        </AdminCard>
      )}
    </Stack>

    <BusinessDetailDrawer businessId={selectedBizId} onClose={() => setSelectedBizId(null)} />
    </motion.div>
  );
};

export default BusinessesTab;
