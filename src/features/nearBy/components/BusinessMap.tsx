import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { IBusiness } from '../types/nearBy.types';

// We use the "Liberty" style which is clean and works well for English labels
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

function setEnglishLabels(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    if (layer.type !== 'symbol') continue;
    // We target layers that have labels
    const layout: any = (layer as any).layout;
    if (!layout || layout['text-field'] == null) continue;

    map.setLayoutProperty(layer.id, 'text-field', [
      'coalesce',
      ['get', 'name:en'], // Prioritize English
      ['get', 'name'],
    ]);
  }
}

type Props = {
  businesses: IBusiness[];
  onBusinessClick?: (id: number) => void;
  userLocation?: { latitude: number; longitude: number } | null;
};

export default function BusinessMap({
  businesses,
  onBusinessClick,
  userLocation,
}: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersByIdRef = useRef<Map<number, maplibregl.Marker>>(new Map());

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
      markersByIdRef.current.forEach((marker) => marker.remove());
      markersByIdRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextIds = new Set<number>();

    businesses.forEach((b) => {
      nextIds.add(b.id);
      if (!markersByIdRef.current.has(b.id)) {
        // Create simple marker (we can style this later with createStationPinElement logic)
        const marker = new maplibregl.Marker()
          .setLngLat([b.longitude, b.latitude])
          .addTo(map);

        marker
          .getElement()
          .addEventListener('click', () => onBusinessClick?.(b.id));
        markersByIdRef.current.set(b.id, marker);
      }
    });

    // Cleanup old markers
    markersByIdRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.remove();
        markersByIdRef.current.delete(id);
      }
    });
  }, [businesses, onBusinessClick]);

  // Recenter when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
      });
    }
  }, [userLocation]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
