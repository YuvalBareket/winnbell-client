import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { NearbyLocation } from '../types/nearBy.types';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Inject pulse keyframe once
const USER_LOCATION_STYLE_ID = 'user-location-pulse';
if (!document.getElementById(USER_LOCATION_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = USER_LOCATION_STYLE_ID;
  style.textContent = `
    @keyframes user-location-pulse {
      0%   { transform: scale(1);   opacity: 0.6; }
      70%  { transform: scale(2.4); opacity: 0;   }
      100% { transform: scale(2.4); opacity: 0;   }
    }
  `;
  document.head.appendChild(style);
}

function createUserLocationMarkerEl(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;width:20px;height:20px;';

  // Pulse ring
  const pulse = document.createElement('div');
  pulse.style.cssText = `
    position:absolute;inset:0;
    border-radius:50%;
    background:rgba(25,93,230,0.35);
    animation:user-location-pulse 2s ease-out infinite;
  `;

  // Inner dot
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:absolute;inset:3px;
    border-radius:50%;
    background:#195de6;
    border:2.5px solid white;
    box-shadow:0 2px 6px rgba(25,93,230,0.5);
  `;

  wrapper.appendChild(pulse);
  wrapper.appendChild(dot);
  return wrapper;
}

function setEnglishLabels(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;
  for (const layer of style.layers) {
    if (layer.type !== 'symbol') continue;
    const layout: any = (layer as any).layout;
    if (!layout || layout['text-field'] == null) continue;
    map.setLayoutProperty(layer.id, 'text-field', [
      'coalesce',
      ['get', 'name:en'],
      ['get', 'name'],
    ]);
  }
}

type Props = {
  locations: NearbyLocation[];
  onBusinessClick?: (locationId: number) => void;
  userLocation?: { latitude: number; longitude: number } | null;
};

export default function BusinessMap({ locations, onBusinessClick, userLocation }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersByLocRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [34.8167, 32.0833],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => setEnglishLabels(map));

    return () => {
      markersByLocRef.current.forEach((m) => m.remove());
      markersByLocRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync business markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextIds = new Set<number>();

    locations?.forEach((loc) => {
      const id = loc.location_id;
      nextIds.add(id);
      if (!markersByLocRef.current.has(id)) {
        const marker = new maplibregl.Marker()
          .setLngLat([loc.longitude, loc.latitude])
          .addTo(map);
        marker.getElement().addEventListener('click', () => onBusinessClick?.(id));
        markersByLocRef.current.set(id, marker);
      }
    });

    markersByLocRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.remove();
        markersByLocRef.current.delete(id);
      }
    });
  }, [locations, onBusinessClick]);

  // User location marker + fly-to
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const lngLat: [number, number] = [userLocation.longitude, userLocation.latitude];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(lngLat);
    } else {
      userMarkerRef.current = new maplibregl.Marker({ element: createUserLocationMarkerEl(), anchor: 'center' })
        .setLngLat(lngLat)
        .addTo(map);
    }

    map.flyTo({ center: lngLat, zoom: 14, essential: true });
  }, [userLocation]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />;
}
