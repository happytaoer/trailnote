import { Marker, Route } from '@/types';

/**
 * Calculate the center point of a map based on markers and routes
 * @param markers - Array of markers to include in calculation
 * @param routes - Array of routes to include in calculation
 * @returns Promise that resolves to [latitude, longitude] or null if no coordinates found
 */
export const calculateMapCenter = async (
  markers: Marker[], 
  routes: Route[]
): Promise<[number, number] | null> => {
  // Dynamically import Leaflet only on client side
  const L = (await import('leaflet')).default;
  const allLatLngs: L.LatLng[] = [];

  // Add marker coordinates
  if (markers && markers.length > 0) {
    markers.forEach(marker => {
      allLatLngs.push(L.latLng(marker.latitude, marker.longitude));
    });
  }

  // Add route coordinates
  if (routes && routes.length > 0) {
    routes.forEach(route => {
      if (route.geojson && route.geojson.geometry && route.geojson.geometry.type === 'LineString') {
        const coordinates = route.geojson.geometry.coordinates as [number, number][];
        coordinates.forEach(coord => {
          // GeoJSON coordinates are [longitude, latitude]
          allLatLngs.push(L.latLng(coord[1], coord[0]));
        });
      }
    });
  }

  // Calculate center if we have coordinates
  if (allLatLngs.length > 0) {
    const bounds = L.latLngBounds(allLatLngs);
    const center = bounds.getCenter();
    return [center.lat, center.lng];
  }
  
  return null; // Return null if no coordinates found
};
