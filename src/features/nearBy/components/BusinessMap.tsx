import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { NearbyLocation } from '../types/nearBy.types';
import type { ViewportBounds } from '../hooks/useNearbyWithZoom';

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  v: 'weekly',
});

// Hides Google POIs, transit icons, and road icons — only works without mapId
const CLEAN_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// Sector → color + Material Icon SVG path (24×24 viewBox)
const SECTOR_MAP: Record<string, { color: string; path: string }> = {
  Food:          { color: '#1976d2', path: 'M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2m5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2' },
  Coffee:        { color: '#795548', path: 'M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3M16 5v3H6V5zm2.5 3H18V5h.5c.83 0 1.5.67 1.5 1.5S19.33 8 18.5 8M4 19h16v2H4z' },
  Bakery:        { color: '#e65100', path: 'M19.28 16.34c-1.21-.89-1.82-1.34-1.82-1.34s.32-.59.96-1.78c.38-.59 1.22-.59 1.6 0l.81 1.26c.19.3.21.68.06 1l-.22.47c-.25.54-.91.72-1.39.39m-14.56 0c-.48.33-1.13.15-1.39-.38l-.23-.47c-.15-.32-.13-.7.06-1l.81-1.26c.38-.59 1.22-.59 1.6 0 .65 1.18.97 1.77.97 1.77s-.61.45-1.82 1.34m10.64-6.97c.09-.68.73-1.06 1.27-.75l1.59.9c.46.26.63.91.36 1.41L16.5 15h-1.8zm-6.73 0L9.3 15H7.5l-2.09-4.08c-.27-.5-.1-1.15.36-1.41l1.59-.9c.53-.3 1.18.08 1.27.76M13.8 15h-3.6l-.74-6.88c-.07-.59.35-1.12.88-1.12h3.3c.53 0 .94.53.88 1.12z' },
  Grocery:       { color: '#2e7d32', path: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2' },
  Retail:        { color: '#9c27b0', path: 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2m4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2z' },
  Beauty:        { color: '#c2185b', path: 'M12 2C9.79 2 8 3.79 8 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 10c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4' },
  Health:        { color: '#00897b', path: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4z' },
  Gym:           { color: '#d32f2f', path: 'M20.57 14.86 22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z' },
  Auto:          { color: '#37474f', path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16m11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5M5 11l1.5-4.5h11L19 11z' },
  Entertainment: { color: '#f57c00', path: 'M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3zM8 17H6v-2h2zm0-4H6v-2h2zm0-4H6V7h2zm10 8h-2v-2h2zm0-4h-2v-2h2zm0-4h-2V7h2z' },
  Education:     { color: '#1565c0', path: 'M5 13.18v4L12 21l7-3.82v-4L12 17zM12 3 1 9l11 6 9-4.91V17h2V9z' },
  Service:       { color: '#607d8b', path: 'm22.7 19-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4' },
};

const DEFAULT_COLOR = '#195de6';

function makePinSvg(sector: string): string {
  const { color, path } = SECTOR_MAP[sector] ?? { color: DEFAULT_COLOR, path: '' };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
    <path d="M19 1C9.61 1 2 8.61 2 18c0 13.25 17 27 17 27S36 31.25 36 18C36 8.61 28.39 1 19 1z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="19" cy="18" r="11" fill="white" opacity="0.93"/>
    <g transform="translate(11,10) scale(0.667)" fill="${color}">
      <path d="${path}"/>
    </g>
  </svg>`;
}

function makePinIcon(sector: string): google.maps.Icon {
  const svg = makePinSvg(sector);
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(26, 32),
    anchor: new google.maps.Point(13, 32),
  };
}

const mapsLib = importLibrary('maps');

type Props = {
  locations: NearbyLocation[];
  onBusinessClick?: (locationId: number) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  onViewportChange?: (bounds: ViewportBounds, zoom: number) => void;
};

function getViewportBounds(map: google.maps.Map): ViewportBounds | null {
  const bounds = map.getBounds();
  if (!bounds) return null;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return { minLat: sw.lat(), maxLat: ne.lat(), minLng: sw.lng(), maxLng: ne.lng() };
}

export default function BusinessMap({ locations, onBusinessClick, userLocation, onViewportChange }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersByLocRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  const onBusinessClickRef = useRef(onBusinessClick);
  onBusinessClickRef.current = onBusinessClick;
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    mapsLib.then(({ Map }) => {
      if (cancelled || !containerRef.current) return;

      const map = new Map(containerRef.current, {
        center: { lat: 27.9944, lng: -81.7603 },
        zoom: 12,
        styles: CLEAN_STYLES,
        disableDefaultUI: true,
        clickableIcons: false,
      });

      mapRef.current = map;
      setMapReady(true);

      map.addListener('idle', () => {
        const b = getViewportBounds(map);
        const zoom = map.getZoom() ?? 12;
        if (b) onViewportChangeRef.current?.(b, zoom);
      });
    });

    return () => {
      cancelled = true;
      markersByLocRef.current.forEach((m) => m.setMap(null));
      markersByLocRef.current.clear();
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Sync business markers — max 50 come from server, render all as individual pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const nextIds = new Set<number>();

    locations?.forEach((loc) => {
      const id = loc.location_id;
      nextIds.add(id);
      if (!markersByLocRef.current.has(id)) {
        const marker = new google.maps.Marker({
          map,
          position: { lat: Number(loc.latitude), lng: Number(loc.longitude) },
          icon: makePinIcon(loc.sector),
          title: loc.name,
          cursor: 'pointer',
        });
        marker.addListener('click', () => onBusinessClickRef.current?.(id));
        markersByLocRef.current.set(id, marker);
      }
    });

    markersByLocRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        markersByLocRef.current.delete(id);
      }
    });
  }, [locations, mapReady]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !mapReady) return;

    const pos = { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) };

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(pos);
    } else {
      const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="10" fill="#195de6" opacity="0.25"/>
        <circle cx="11" cy="11" r="6" fill="#195de6" stroke="white" stroke-width="2.5"/>
      </svg>`;
      userMarkerRef.current = new google.maps.Marker({
        map,
        position: pos,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userSvg)}`,
          scaledSize: new google.maps.Size(22, 22),
          anchor: new google.maps.Point(11, 11),
        },
        title: 'Your location',
        zIndex: 999,
      });
    }

    map.panTo(pos);
    map.setZoom(14);
  }, [userLocation, mapReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />;
}
