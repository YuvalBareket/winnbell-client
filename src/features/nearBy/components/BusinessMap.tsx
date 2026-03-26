import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { NearbyLocation } from '../types/nearBy.types';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

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
  // FIX: This now explicitly expects the locationId to match the Page state
  onBusinessClick?: (locationId: number) => void; 
  userLocation?: { latitude: number; longitude: number } | null;
};

export default function BusinessMap({
  locations,
  onBusinessClick,
  userLocation,
}: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // KEY FIX: Store markers by location_id
  const markersByLocRef = useRef<Map<number, maplibregl.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [34.8167, 32.0833], // Default to Ramat Gan
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      setEnglishLabels(map);
    });

    return () => {
      markersByLocRef.current.forEach((marker) => marker.remove());
      markersByLocRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextLocationIds = new Set<number>();

    locations?.forEach((loc) => {
      const locId = loc.location_id;
      nextLocationIds.add(locId);

      if (!markersByLocRef.current.has(locId)) {
        const marker = new maplibregl.Marker()
          .setLngLat([loc.longitude, loc.latitude])
          .addTo(map);

        // FIX: Pass loc.location_id so the NearbyPage can find the right branch
        marker
          .getElement()
          .addEventListener('click', () => onBusinessClick?.(loc.location_id));
        
        markersByLocRef.current.set(locId, marker);
      }
    });

    // Cleanup old markers
    markersByLocRef.current.forEach((marker, id) => {
      if (!nextLocationIds.has(id)) {
        marker.remove();
        markersByLocRef.current.delete(id);
      }
    });
  }, [locations, onBusinessClick]);

  // Recenter when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        essential: true
      });
    }
  }, [userLocation]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />;
}