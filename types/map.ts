import { Marker, Route, FeatureInfo } from './index';
import L from 'leaflet';

/**
 * Props for MapController component. All marker/route state is managed by parent (MapComponent).
 */
export interface MapControllerProps {
  projectId?: number | null;
  localMarkers: Marker[];
  localRoutes: Route[];
  activeFeature: Marker | Route | null;
  featureInfo: FeatureInfo;
  onInfoPanelVisibilityChange?: (visible: boolean) => void;
  handleMarkerClick: (marker: Marker) => void;
  handleRouteClick: (route: Route) => void;
  onMarkerCreate?: (marker: Marker) => void;
  onRouteCreate?: (route: Route) => void;
  onMarkerDelete?: (markerId: number) => void;
  onRouteDelete?: (routeId: number) => void;
  onFeatureSelect?: (feature: Marker | Route | null, type: 'marker' | 'route' | null) => void;
  drawControlRef: React.RefObject<L.Control.Draw | null>;
  drawnItemsRef: React.RefObject<L.FeatureGroup | null>;
  mapRef?: React.RefObject<L.Map | null>;
  enableEditMode?: (featureId: number) => void;
  disableEditMode?: () => void;
  saveEditChanges?: () => void;
  isSharedMode?: boolean;
  isFreehandDrawing?: boolean;
  currentFreehandPath?: L.LatLng[];
  onFreehandPathUpdate?: (path: L.LatLng[]) => void;
  onFreehandComplete?: (path: L.LatLng[]) => void;
  isMeasuring?: boolean;
  onMeasureClick?: (latlng: L.LatLng) => void;
}
