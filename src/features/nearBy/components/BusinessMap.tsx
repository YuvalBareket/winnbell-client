import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { NearbyLocation } from '../types/nearBy.types';
import type { ViewportBounds } from '../hooks/useNearbyWithZoom';
import { SECTOR_CONFIG, DEFAULT_SECTOR } from '../../../shared/sectorConfig';

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

function getSectorConfig(sector: string | null | undefined) {
  if (!sector) return DEFAULT_SECTOR;
  const key = sector.trim();
  // exact match first, then try title-case normalisation
  return (
    SECTOR_CONFIG[key] ??
    SECTOR_CONFIG[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] ??
    DEFAULT_SECTOR
  );
}

function makePinSvg(sector: string | null | undefined, capReached = false): string {
  const { color, iconPath } = getSectorConfig(sector);
  const pinColor = color;
  const opacity = capReached ? '0.6' : '1';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46" opacity="${opacity}">
    <path d="M19 1C9.61 1 2 8.61 2 18c0 13.25 17 27 17 27S36 31.25 36 18C36 8.61 28.39 1 19 1z" fill="${pinColor}" stroke="white" stroke-width="1.5"/>
    <circle cx="19" cy="18" r="11" fill="white" opacity="0.93"/>
    <g transform="translate(11,10) scale(0.667)" fill="${pinColor}">
      <path d="${iconPath}"/>
    </g>
  </svg>`;
}

function makePinIcon(sector: string | null | undefined, capReached = false): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makePinSvg(sector, capReached))}`,
    scaledSize: new google.maps.Size(26, 32),
    anchor: new google.maps.Point(13, 32),
  };
}

const mapsLib = importLibrary('maps');

type Props = {
  locations: NearbyLocation[];
  onBusinessClick?: (locationId: number) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  onViewportChange?: (bounds: ViewportBounds) => void;
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
        if (b) onViewportChangeRef.current?.(b);
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

  // Sync business markers
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
          icon: makePinIcon(loc.sector, loc.cap_reached),
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
        <circle cx="11" cy="11" r="10" fill="#0292b7" opacity="0.25"/>
        <circle cx="11" cy="11" r="6" fill="#0292b7" stroke="white" stroke-width="2.5"/>
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
