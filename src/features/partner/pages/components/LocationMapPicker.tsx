import { useEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { OpenWith, MyLocation } from '@mui/icons-material';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING, BORDER_LIGHT, BG_SUBTLE } from '../../../../shared/colors';

setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '', v: 'weekly' });
const mapsLib = importLibrary('maps');

// Default view before an address is chosen (Newark, DE - the company base).
const DEFAULT_CENTER = { lat: 39.6837, lng: -75.7497 };

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
};

/** Single draggable pin for picking / fine-tuning a business location, matching the setup mockup. */
export default function LocationMapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initial = useRef({ lat, lng });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    mapsLib.then(({ Map }) => {
      if (cancelled || !containerRef.current) return;
      const has = initial.current.lat != null && initial.current.lng != null;
      const center = has ? { lat: initial.current.lat as number, lng: initial.current.lng as number } : DEFAULT_CENTER;
      const map = new Map(containerRef.current, {
        center,
        zoom: has ? 16 : 11,
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });
      mapRef.current = map;
      const marker = new google.maps.Marker({ position: center, map, draggable: true, visible: has });
      markerRef.current = marker;
      marker.addListener('dragend', () => {
        const p = marker.getPosition();
        if (p) onChangeRef.current(p.lat(), p.lng());
      });
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        marker.setPosition(e.latLng);
        marker.setVisible(true);
        onChangeRef.current(e.latLng.lat(), e.latLng.lng());
      });
    });
    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  // Move the pin + camera when the address search resolves a new coordinate.
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || lat == null || lng == null) return;
    const pos = { lat, lng };
    marker.setPosition(pos);
    marker.setVisible(true);
    map.panTo(pos);
    map.setZoom(16);
  }, [lat, lng]);

  const recenter = () => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const p = marker?.getPosition();
    if (map && p) { map.panTo(p); map.setZoom(16); }
  };

  return (
    <Box sx={{ position: 'relative', height: 264, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}`, bgcolor: BG_SUBTLE }}>
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
      <Stack direction='row' alignItems='center' spacing={0.75} sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'white', borderRadius: '9px', px: 1.25, py: 0.75, boxShadow: `0 4px 10px -4px ${alpha(TEXT_HEADING, 0.25)}` }}>
        <OpenWith sx={{ fontSize: 14, color: PRIMARY_MAIN }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_SECONDARY }}>Drag pin to adjust</Typography>
      </Stack>
      <Box onClick={recenter} role='button' tabIndex={0} aria-label='Recenter map' onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); recenter(); } }} sx={{ position: 'absolute', bottom: 12, right: 12, width: 40, height: 40, borderRadius: '12px', bgcolor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 14px -6px ${alpha(TEXT_HEADING, 0.3)}` }}>
        <MyLocation sx={{ fontSize: 19, color: PRIMARY_MAIN }} />
      </Box>
    </Box>
  );
}
