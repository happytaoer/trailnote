'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { message, Spin } from 'antd';
import { markersApi, routesApi } from '@/lib/api';
import { Marker, Route, FeatureInfo, Image } from '@/types';
import * as turf from '@turf/turf';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedFeatureStore } from '@/stores';
import { simplify } from '@turf/simplify';
import FeatureInfoPanel from './FeatureInfoPanel';
import MapController from './MapController';
import MapLayer, { mapLayers } from './MapLayer';
import MapButton from './MapButton';
import MapSearch from './MapSearch';
import { useLocationStore, useMapStore, useSharedMapStore, useDrawingStore } from '@/stores';
import _ from 'lodash';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Import Leaflet Draw
import 'leaflet-draw';

// Define custom types for Leaflet.Draw to fix TypeScript errors
declare module 'leaflet' {
  namespace Draw {
    interface EditOptions {
      featureGroup: L.FeatureGroup;
      poly?: {
        allowIntersection?: boolean;
      };
    }
    
    namespace DrawOptions {
      interface MarkerOptions {
        icon?: L.Icon;
      }
      
      interface PolylineOptions {
        shapeOptions?: L.PolylineOptions;
      }
    }
  }
}

interface MapComponentProps {
  projectId: number | null;
  initialCenter?: [number, number] | null;
  onMapReady?: (mapInstance: L.Map) => void;
  sidebarCollapsed: boolean;
  sidebarWidth?: number;
  isSharedMode?: boolean; // Whether map is in read-only mode (for shared views)
  permissions?: {
    canSelectMapLayer: boolean;
    canDrawMarker: boolean;
    canDrawPolyline: boolean;
    canFreehandDraw: boolean;
    canMeasureDistance: boolean;
    canZoom: boolean;
    canLocate: boolean;
  };
  imagesByFeature?: Record<string, Image[]>;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  projectId,
  initialCenter,
  onMapReady,
  sidebarCollapsed,
  sidebarWidth = 416, // Default width (26rem = 416px)
  isSharedMode = false, // Default to false (editing enabled)
  permissions = {
    canSelectMapLayer: true,
    canDrawMarker: true,
    canDrawPolyline: true,
    canFreehandDraw: true,
    canMeasureDistance: true,
    canZoom: true,
    canLocate: true
  },
  imagesByFeature = {}
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState<Marker | Route | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featureInfo, setFeatureInfo] = useState<FeatureInfo>({
    id: 0,
    type: '' as 'marker' | 'route',
    name: '',
    description: '',
    color: '#3887be',
    width: '3',
    opacity: 1.0,
    status: 'visited'
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter || [30.6667, 104.0667]); // Use initialCenter or default
  const [mapZoom, setMapZoom] = useState(11);
  const [activeMapLayer, setActiveMapLayer] = useState(mapLayers[0]);
  
  // Use Drawing Store for all drawing-related state
  const {
    // Freehand Drawing State
    isFreehandDrawing,
    currentFreehandPath,
    setFreehandDrawing,
    setCurrentFreehandPath,
    addFreehandPoint,
    resetFreehandDrawing,
    
    // Measurement State
    isMeasuring,
    measurePoints,
    measureLines,
    totalDistance,
    canUndo,
    setMeasuring,
    setMeasurePoints,
    setMeasureLines,
    setTotalDistance,
    setCanUndo,
    clearMeasurements: clearMeasurementsStore,
    resetMeasurement,
    
    // General Actions
    exitAllDrawingModes
  } = useDrawingStore();
  // Type definitions for Leaflet layers to improve type safety
  type LeafletLayer = L.Layer;
  type LayerEventHandler = (layer: L.Layer) => void;
  type ErrorHandler = (error: Error) => void;
  
  // Distance calculation constants
  const DISTANCE_THRESHOLD = 1000; // 1000 meters = 1 km
  const MARKER_RADIUS = 8;
  const LINE_WEIGHT = 4;
  const DASH_ARRAY = '8, 4';
  const MARKER_COLOR = '#ff7800';
  const LINE_COLOR = '#ff7800';
  const LABEL_COLOR = '#000000';

  // Optimized distance calculation function
  const calculateTotalDistance = useCallback((points: L.LatLng[]): number => {
    if (points.length < 2) return 0;
    return points.slice(1).reduce((total, current, index) => {
      return total + points[index].distanceTo(current);
    }, 0);
  }, []);

  // Format distance display
  const formatDistance = useCallback((distance: number): string => {
    return distance >= DISTANCE_THRESHOLD
      ? `${(distance / DISTANCE_THRESHOLD).toFixed(2)} km`
      : `${distance.toFixed(0)} m`;
  }, []);

  // Use stores
  const { 
    currentPosition, 
    isLocating, 
    locationError, 
    getCurrentPosition, 
    clearLocationError 
  } = useLocationStore();
  
  // Use different stores based on shared mode
  const mapStore = useMapStore();
  const sharedMapStore = useSharedMapStore();
  
  // Use selected feature store for focus handling
  const { featureToFocus, clearFeatureToFocus } = useSelectedFeatureStore();
  
  const {
    markers,
    routes,
    addMarker,
    updateMarker,
    deleteMarker,
    addRoute,
    updateRoute,
    deleteRoute
  } = isSharedMode ? {
    markers: sharedMapStore.markers,
    routes: sharedMapStore.routes,
    addMarker: () => {}, // No-op in shared mode
    updateMarker: () => {}, // No-op in shared mode
    deleteMarker: () => {}, // No-op in shared mode
    addRoute: () => {}, // No-op in shared mode
    updateRoute: () => {}, // No-op in shared mode
    deleteRoute: () => {} // No-op in shared mode
  } : mapStore;
  const mapRef = useRef<L.Map | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const editHandlerRef = useRef<L.EditToolbar.Edit | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map reference and expose it to parent component
  // Using a ref to track if onMapReady has been called
  const onMapReadyCalledRef = useRef(false);

  // Effect to update map center when initialCenter prop changes
  useEffect(() => {
    if (initialCenter && mapRef.current) {
      // Check if the current map center is different from the initialCenter to avoid unnecessary re-renders/pan
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter.lat !== initialCenter[0] || currentCenter.lng !== initialCenter[1]) {
        mapRef.current.flyTo(initialCenter, mapRef.current.getZoom(), {
          animate: true,
          duration: 0.5
        });
      }
    }
  }, [initialCenter]);

  // Handle freehand drawing
  const handleFreehandPathUpdate = useCallback((path: L.LatLng[]) => {
    setCurrentFreehandPath(path);
  }, [setCurrentFreehandPath]);

  const handleFreehandComplete = useCallback(async (path: L.LatLng[]) => {
    if (!projectId || path.length < 2) {
      resetFreehandDrawing();
      return;
    }

    try {
      // Convert path to coordinates
      const coordinates = path.map((latlng: L.LatLng) => {
        const wrappedLatLng = latlng.wrap();
        return [wrappedLatLng.lng, wrappedLatLng.lat];
      });

      // Simplify path to reduce coordinate count while maintaining shape
      // Use tolerance of 0.001 degrees (about 100 meters) to remove redundant points
      const simplifiedCoordinates = coordinates.length > 2
        ? simplify(turf.lineString(coordinates), { tolerance: 0.001, highQuality: true }).geometry.coordinates
        : coordinates;

      // Get user's default route settings
      const defaultRouteColor = user?.settings?.route_color || '#3887be';
      const defaultRouteWidth = user?.settings?.route_width || '3';
      const defaultRouteOpacity = parseFloat(user?.settings?.route_opacity || '1.0');

      // Create GeoJSON from coordinates
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: simplifiedCoordinates
        },
        properties: {}
      };

      // Calculate distance using simplified coordinates
      const line = turf.lineString(simplifiedCoordinates);
      const distance = turf.length(line, { units: 'meters' });

      // Create route object
      const routeData = {
        project_id: projectId,
        route_name: `Freehand Route ${new Date().toLocaleTimeString()}`,
        description: 'Created with freehand drawing',
        geojson,
        route_distance: distance,
        route_color: defaultRouteColor,
        route_width: defaultRouteWidth,
        route_opacity: defaultRouteOpacity,
        status: 'visited' as const
      };

      // Save to database
      const newRoute = await routesApi.createRoute(routeData);
      addRoute(newRoute);

      messageApi.success(`Freehand route created successfully! (${coordinates.length} → ${simplifiedCoordinates.length} points)`);
    } catch (error) {
      console.error('Error creating freehand route:', error);
      messageApi.error('Failed to create freehand route');
    } finally {
      resetFreehandDrawing();
    }
  }, [projectId, user?.settings, addRoute, messageApi, resetFreehandDrawing]);

  // Handle measure distance
  const handleMeasureClick = useCallback((latlng: L.LatLng) => {
    if (!mapRef.current || !isMeasuring) return;

    // Validate coordinates
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') {
      console.warn('Invalid coordinates provided for measurement');
      return;
    }

    // Check for invalid coordinates (NaN, Infinity)
    if (!isFinite(latlng.lat) || !isFinite(latlng.lng)) {
      console.warn('Invalid coordinates (NaN or Infinity) provided for measurement');
      return;
    }

    const newPoints = [...measurePoints, latlng];
    setMeasurePoints(newPoints);

    // Create marker for the point
    const marker = L.circleMarker(latlng, {
      radius: MARKER_RADIUS,
      fillColor: MARKER_COLOR,
      color: '#fff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(mapRef.current);

    // Calculate distances (moved outside for better performance)
    let segmentDistance = 0;
    let newTotalDistance = totalDistance;

    // If we have at least 2 points, draw a line and calculate distance
    if (newPoints.length >= 2) {
      const prevPoint = newPoints[newPoints.length - 2];
      const currentPoint = latlng;

      // Validate previous point
      if (!prevPoint || typeof prevPoint.lat !== 'number' || typeof prevPoint.lng !== 'number') {
        console.warn('Invalid previous point in measurement');
        return;
      }

      // Calculate only the new segment distance (more efficient)
      try {
        segmentDistance = prevPoint.distanceTo(currentPoint);
        newTotalDistance = totalDistance + segmentDistance;
        setTotalDistance(newTotalDistance);
      } catch (error) {
        console.error('Error calculating distance:', error);
        return;
      }

      const distanceText = formatDistance(segmentDistance);

      // Create line
      const line = L.polyline([prevPoint, currentPoint], {
        color: LINE_COLOR,
        weight: LINE_WEIGHT,
        opacity: 1,
        dashArray: DASH_ARRAY
      }).addTo(mapRef.current);

      // Add distance label at midpoint
      const midpoint = L.latLng(
        (prevPoint.lat + currentPoint.lat) / 2,
        (prevPoint.lng + currentPoint.lng) / 2
      );

      const label = L.marker(midpoint, {
        icon: L.divIcon({
          className: 'measure-label',
          html: `<div style="
            background: transparent;
            color: ${LABEL_COLOR};
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1;
          ">${distanceText}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      }).addTo(mapRef.current);

      setMeasureLines([...measureLines, line, marker, label]);
    } else {
      setMeasureLines([...measureLines, marker]);
    }

    // Update undo availability
    setCanUndo(true);

    // Show total distance only when we have multiple segments
    if (newPoints.length >= 3) {
      const totalText = formatDistance(newTotalDistance);

      messageApi.info({
        content: `Total distance: ${totalText}`,
        duration: 3,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '20vh'
        }
      });
    }
  }, [isMeasuring, measurePoints, totalDistance, formatDistance, messageApi, canUndo, setMeasurePoints, setMeasureLines, setTotalDistance, setCanUndo]);

  // Clear measurements function that also removes from map
  const clearMeasurements = useCallback(() => {
    if (!mapRef.current) return;

    // Remove all measurement lines and markers from map
    measureLines.forEach((line: L.Polyline | L.CircleMarker | L.Marker) => {
      if (mapRef.current && mapRef.current.hasLayer(line)) {
        mapRef.current.removeLayer(line);
      }
    });

    // Use store function to clear state
    clearMeasurementsStore();
  }, [measureLines, clearMeasurementsStore]);

  // Undo last measurement step
  const undoMeasurement = useCallback(() => {
    if (!canUndo || measurePoints.length === 0) return;

    // Calculate new total distance without the last segment
    const newPoints = measurePoints.slice(0, -1);
    const newTotalDistance = calculateTotalDistance(newPoints);

    // Remove last added layers from map
    const lastSegmentLayers = measureLines.slice(-3); // Last segment: line, marker, label

    lastSegmentLayers.forEach((layer: L.Polyline | L.CircleMarker | L.Marker) => {
      if (mapRef.current && mapRef.current.hasLayer(layer)) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Update state
    setMeasurePoints(newPoints);
    setMeasureLines(measureLines.slice(0, -3)); // Remove last 3 layers
    setTotalDistance(newTotalDistance);
    setCanUndo(newPoints.length > 0);

    // Show updated total distance
    if (newPoints.length >= 2) {
      const totalText = formatDistance(newTotalDistance);
      messageApi.info({
        content: `Total distance: ${totalText}`,
        duration: 2,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '20vh'
        }
      });
    }
  }, [canUndo, measurePoints, measureLines, calculateTotalDistance, formatDistance, messageApi, setMeasurePoints, setMeasureLines, setTotalDistance, setCanUndo]);

  // Handle user location
  const getUserLocation = useCallback(async () => {
    if (!mapRef.current) return;
    
    // Clear any previous error
    clearLocationError();
    
    const userLocationIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div class="pulse-animation"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    // Add CSS for the pulse animation if it doesn't exist
    const styleId = 'user-location-style';
    if (typeof window !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .user-location-marker {
          position: relative;
        }
        .pulse-animation {
          width: 16px;
          height: 16px;
          background-color: rgba(22, 119, 255, 0.6);
          border-radius: 50%;
          position: relative;
        }
        .pulse-animation:after {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px solid #1677ff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Get current position using the store
    const position = await getCurrentPosition();
    
    if (position && mapRef.current) {
      const [latitude, longitude] = position;
      
      // Remove existing user location marker if it exists
      if (userLocationMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = null;
      }
      
      // Create the user location marker
      userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userLocationIcon }).addTo(mapRef.current);
      
      // Fly to the user's location
      mapRef.current.flyTo([latitude, longitude], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [getCurrentPosition, clearLocationError]);
  
  // Automatically request user location when no projects exist
  useEffect(() => {
    // Check if projectId is null or undefined and there are no markers or routes
    if (projectId === null || projectId === undefined) {
      if (markers.length === 0 && routes.length === 0) {
        // Wait a short delay to ensure the map is fully initialized
        const timer = setTimeout(() => {
          getUserLocation();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [projectId, markers.length, routes.length, getUserLocation]);

  // Effect to handle feature focus from sidebar
  useEffect(() => {
    if (featureToFocus) {
      console.log('MapComponent: featureToFocus received', featureToFocus);
      const { feature, type, openInEditMode } = featureToFocus;
      
      if (type === 'marker') {
        handleMarkerClick(feature as Marker);
      } else if (type === 'route') {
        handleRouteClick(feature as Route);
      }
      
      // If openInEditMode is true, set the panel to edit mode immediately
      if (openInEditMode) {
        console.log('MapComponent: openInEditMode is true, setting edit mode');
        // Short delay to ensure panel is open first
        setTimeout(() => {
          setIsEditMode(true);
          if (featureInfo.id) {
            enableEditMode(featureInfo.id);
          }
        }, 100);
      }
      
      // Clear the featureToFocus after processing
      clearFeatureToFocus();
    }
  }, [featureToFocus, clearFeatureToFocus]);

  // Effect to update UI coordinates when marker is moved on the map
  useEffect(() => {
    if (!isEditMode || !activeFeature || featureInfo.type !== 'marker' || !drawnItemsRef.current) return;
    
    const updateInterval = setInterval(() => {
      drawnItemsRef.current?.eachLayer((layer: any) => {
        if (layer._ID === featureInfo.id && layer instanceof L.Marker) {
          const latlng = layer.getLatLng().wrap();
          
          // Only update if the values have changed
          if (latlng.lat !== featureInfo.latitude || latlng.lng !== featureInfo.longitude) {
            setFeatureInfo(prev => ({
              ...prev,
              latitude: latlng.lat,
              longitude: latlng.lng
            }));
          }
        }
      });
    }, 100); // Check every 100ms while in edit mode
    
    return () => clearInterval(updateInterval);
  }, [isEditMode, activeFeature, featureInfo.id, featureInfo.type]);
  
  // Effect to update marker position on map when coordinates are updated in UI
  useEffect(() => {
    if (!isEditMode || !activeFeature || featureInfo.type !== 'marker' || !drawnItemsRef.current) return;
    if (featureInfo.latitude === undefined || featureInfo.longitude === undefined) return;
    
    // Find the marker on the map
    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer._ID === featureInfo.id && layer instanceof L.Marker) {
        const currentLatLng = layer.getLatLng();
        const newLat = parseFloat(String(featureInfo.latitude));
        const newLng = parseFloat(String(featureInfo.longitude));
        
        // Check if values are valid numbers and different from current position
        if (!isNaN(newLat) && !isNaN(newLng) && 
            (currentLatLng.lat !== newLat || currentLatLng.lng !== newLng)) {
          // Update marker position on the map
          layer.setLatLng([newLat, newLng]);
        }
      }
    });
  }, [isEditMode, activeFeature, featureInfo.id, featureInfo.latitude, featureInfo.longitude, featureInfo.type]);
  
  // Effect to close info panel when the active feature is deleted
  useEffect(() => {
    // If there is an active feature and the info panel is showing
    if (activeFeature && showInfoPanel) {
      const featureId = activeFeature.id;
      const featureType = featureInfo.type;
      
      // Check if this feature still exists in the markers or routes array
      const stillExists = featureType === 'marker' 
        ? markers.some(m => m.id === featureId)
        : routes.some(r => r.id === featureId);
      
      // If the feature no longer exists, close the info panel
      if (!stillExists) {
        setShowInfoPanel(false);
        setActiveFeature(null);
      }
    }
  }, [markers, routes, activeFeature, showInfoPanel]);

  // Cleanup user location marker on unmount
  useEffect(() => {
    return () => {
      if (userLocationMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = null;
      }
    };
  }, []);

  // Handle keyboard shortcuts for measurement undo and freehand drawing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to exit freehand drawing mode
      if (event.key === 'Escape' && isFreehandDrawing) {
        event.preventDefault();
        // Clear freehand drawing state
        resetFreehandDrawing();
        return;
      }

      // ESC key to exit measure distance mode
      if (event.key === 'Escape' && isMeasuring) {
        event.preventDefault();
        // Clear all measurements and reset state
        clearMeasurements();
        setMeasuring(false);
        return;
      }

      // Ctrl+Z for measurement undo (only when measuring)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo && isMeasuring) {
          undoMeasurement();
        }
      }
    };

    // Add event listener when measuring or freehand drawing is active
    if (isMeasuring || isFreehandDrawing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [canUndo, isMeasuring, isFreehandDrawing, undoMeasurement, clearMeasurements, resetFreehandDrawing, setMeasuring]);

  // Handle map ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    
    // Only call onMapReady once
    if (onMapReady && !onMapReadyCalledRef.current) {
      onMapReadyCalledRef.current = true;
      onMapReady(map);
    }
  };

  // Handle marker click
  const handleMarkerClick = (marker: Marker) => {
    setActiveFeature(marker);
    setFeatureInfo({
      id: marker.id,
      type: 'marker',
      name: marker.marker_name || '',
      description: marker.marker_description || '',
      color: '#3887be',
      width: '3',
      latitude: marker.latitude,
      longitude: marker.longitude,
      status: (marker.status as 'visited' | 'not_visited') || 'visited',
      opacity: 1.0,
    });
    setShowInfoPanel(true);
    
    // Fly to marker with smooth animation, preserving current zoom level
    if (mapRef.current) {
      mapRef.current.panTo([marker.latitude, marker.longitude]);
    }
  };
  
  // Handle route click
  const handleRouteClick = (route: Route) => {
    setActiveFeature(route);
    setFeatureInfo({
      id: route.id,
      type: 'route',
      name: route.route_name || '',
      description: route.description || '',
      color: route.route_color || '#3887be',
      width: route.route_width || '3',
      latitude: 0,
      longitude: 0,
      route_distance: route.route_distance || 0,
      status: (route.status as 'visited' | 'not_visited') || 'visited',
      opacity: route.route_opacity || 1.0,
    });
    setShowInfoPanel(true);
    
    // Create bounds for the entire route and fly to it
    if (mapRef.current && route.geojson?.geometry?.coordinates?.length > 0) {
      const coordinates = route.geojson.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      );
      const center  = L.latLngBounds(coordinates).getCenter();
      mapRef.current.panTo(center);
    }
  };
  
  // Save feature changes
  /**
   * Save changes to the marker
   * @param featureInfo Marker information
   */
  const saveMarkerChanges = async (featureInfo: FeatureInfo): Promise<void> => {
    // Use the values from the featureInfo object which should be in sync with the map
    let currentLatLng: { lat: number; lng: number } = { 
      lat: featureInfo.latitude || 0, 
      lng: featureInfo.longitude || 0 
    };
    let currentGeojson: any = null;
    
    // Also check the actual layer position as a fallback
    if (drawnItemsRef.current) {
      drawnItemsRef.current.eachLayer((layer: any) => {
        if (layer._ID === featureInfo.id && layer instanceof L.Marker) {
          const latlng = layer.getLatLng().wrap();
          currentLatLng = { lat: latlng.lat, lng: latlng.lng };
          currentGeojson = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [currentLatLng.lng, currentLatLng.lat]
            },
            properties: {}
          };
        }
      });
    }
    const updatedMarker: Marker = await markersApi.updateMarker(featureInfo.id, {
      marker_name: featureInfo.name,
      marker_description: featureInfo.description,
      latitude: currentLatLng.lat,
      longitude: currentLatLng.lng,
      geojson: currentGeojson,
      status: featureInfo.status || 'visited'
    });
    
    // Update marker in store
    updateMarker(updatedMarker);
  };

  /**
   * Save changes to the route
   * @param featureInfo Route information
   */
  const saveRouteChanges = async (featureInfo: FeatureInfo): Promise<void> => {
    let currentCoordinates: [number, number][] = [];
    let currentGeojson: any = null;
    let startPoint: { lat: number; lng: number } = { lat: 0, lng: 0 };
    let endPoint: { lat: number; lng: number } = { lat: 0, lng: 0 };
    let distance: number = 0;
    if (drawnItemsRef.current) {
      drawnItemsRef.current.eachLayer((layer: any) => {
        if (layer._ID === featureInfo.id && layer instanceof L.Polyline) {
          const latlngs = layer.getLatLngs();
          const flattenedLatLngs: L.LatLng[] = _.flattenDeep(latlngs).filter((item): item is L.LatLng => item instanceof L.LatLng);
          if (flattenedLatLngs.length > 0) {
            currentCoordinates = flattenedLatLngs.map((latlng) => {
              const wrapped = latlng.wrap();
              return [wrapped.lng, wrapped.lat];
            });
            if (currentCoordinates.length > 1) {
              const line = turf.lineString(currentCoordinates);
              distance = turf.length(line, { units: 'meters' });
            }
            const startLatLng = flattenedLatLngs[0].wrap();
            const endLatLng = flattenedLatLngs[flattenedLatLngs.length - 1].wrap();
            startPoint = {
              lat: startLatLng.lat,
              lng: startLatLng.lng
            };
            endPoint = {
              lat: endLatLng.lat,
              lng: endLatLng.lng
            };
            currentGeojson = {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: currentCoordinates
              },
              properties: {}
            };
          }
        }
      });
    }
    const updatedRoute: Route = await routesApi.updateRoute(featureInfo.id, {
      route_name: featureInfo.name,
      description: featureInfo.description,
      route_color: featureInfo.color,
      route_width: featureInfo.width,
      route_opacity: featureInfo.opacity ?? 1.0,
      geojson: currentGeojson,
      route_distance: distance,
      start_latitude: startPoint.lat,
      start_longitude: startPoint.lng,
      end_latitude: endPoint.lat,
      end_longitude: endPoint.lng,
      status: featureInfo.status || 'visited'
    });
    // Update route in store
    updateRoute(updatedRoute);
  };

  /**
   * Save changes to map features (marker or route)
   */
  const saveFeatureChanges = async (): Promise<void> => {
    if (!featureInfo.id) return;
    setIsSaving(true);
    try {
      if (featureInfo.type === 'marker') {
        await saveMarkerChanges(featureInfo);
      } else {
        await saveRouteChanges(featureInfo);
      }
    } catch (error: any) {
      messageApi.error(`Error saving feature: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete feature
  const deleteFeature = async () => {
    if (!featureInfo.id) return;
  
    // Find the layer to delete
    let layerToDelete: L.Layer | null = null;

    if (drawnItemsRef.current) {
      drawnItemsRef.current.eachLayer((layer: any) => {
        if (layer._ID === featureInfo.id) {
          layerToDelete = layer;
        }
      });
    }

    // If the layer is found, use Leaflet.Draw's delete functionality to remove it
    if (layerToDelete && drawnItemsRef.current) {
      // Create a temporary FeatureGroup to hold the layer to be deleted
      const tempGroup = new L.FeatureGroup();
      tempGroup.addLayer(layerToDelete);
      
      // Trigger the delete event
      if (mapRef.current) {
        // Remove the layer from drawnItems
        drawnItemsRef.current.removeLayer(layerToDelete);
        
        // Manually trigger the delete event so Leaflet.Draw knows the layer has been deleted
        mapRef.current.fire(L.Draw.Event.DELETED, { layers: tempGroup });
      }
    }

    // Close the panel after successful delete
    setShowInfoPanel(false);
  };  

  const enableEditMode = (featureId: number) => {
    if (!mapRef.current || !drawnItemsRef.current) return;
    
    // First, disable any existing edit mode
    if (editHandlerRef.current) {
      editHandlerRef.current.disable();
      editHandlerRef.current = null;
    }
    
    // Find the layer to edit
    let targetLayer: L.Layer | null = null;
    drawnItemsRef.current.eachLayer((layer: any) => {
      if (layer._ID === featureId) {
        targetLayer = layer;
      }
    });
    
    if (!targetLayer) return;
    
    // Create a temporary FeatureGroup containing only the target layer
    const editableFeatureGroup = new L.FeatureGroup();
    mapRef.current.addLayer(editableFeatureGroup);
    editableFeatureGroup.addLayer(targetLayer);
    
    // Create the edit handler for only the target layer
    // @ts-expect-error Leaflet.Draw types are not fully compatible with standard Map types
    editHandlerRef.current = new L.EditToolbar.Edit(mapRef.current as L.Map, {
      featureGroup: editableFeatureGroup,
      selectedPathOptions: {
        color: '#fe57a1',
        opacity: 0.6,
        dashArray: '10, 10',
        fillOpacity: 0.1
      }
    });
    
    // Enable edit mode
    editHandlerRef.current.enable();
    
    // Ensure the target layer enters edit state
    if (targetLayer && (targetLayer as any).editing) {
      (targetLayer as any).editing.enable();
    }
    
    // If it's a marker, add dragend event to update coordinates in the UI
    if (featureInfo.type === 'marker') {
      const markerLayer = targetLayer as L.Marker;
      if (markerLayer && typeof markerLayer.on === 'function') {
        markerLayer.on('dragend', (e: L.LeafletEvent) => {
          const target = e.target as L.Marker;
          const latlng = target.getLatLng().wrap();
          setFeatureInfo(prev => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng
          }));
        });
      }
    }
  };

  const disableEditMode = () => {
    if (!mapRef.current || !editHandlerRef.current) return;
    
      // 使用 Leaflet.draw 的原生回退功能
      editHandlerRef.current.revertLayers();
      editHandlerRef.current.disable();
      editHandlerRef.current = null;
  };

  const saveEditChanges = () => {
    if (!mapRef.current || !editHandlerRef.current) return;
    
      // 使用 Leaflet.draw 的原生保存功能
      editHandlerRef.current.save();
      editHandlerRef.current.disable();
      editHandlerRef.current = null;
  };

  return (
    <div className="relative w-full h-full">
      {contextHolder}
      
      {/* Location Loading Overlay */}
      {isLocating && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4 pointer-events-auto">
            <Spin size="large" />
            <div className="text-gray-800 font-medium">Getting your location...</div>
            <div className="text-gray-600 text-sm">Please allow location access in your browser</div>
          </div>
        </div>
      )}

      {/* MapSearch Component */}
      <MapSearch
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        onLocationSelect={({ coordinates, result }) => {
          if (mapRef.current) {
            const isCountry = result.place_type && result.place_type.includes('country');
            mapRef.current.flyTo(coordinates, isCountry ? 5 : 14, {
              animate: true,
              duration: 1
            });
          }
        }}
      />

      {/* Location error message */}
      {locationError && (
        <div className="absolute top-4 left-4 z-50 bg-white px-3 py-2 rounded-md shadow-md border-l-4 border-red-500">
          <span className="text-sm text-red-500">{locationError}</span>
        </div>
      )}
      {/* Map Layer Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <MapLayer
          activeLayer={activeMapLayer}
          onLayerChange={setActiveMapLayer}
        />
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <MapButton
            onOpen={() => {
              // Open layer selection modal
              const evt = new CustomEvent('openLayerModal');
              window.dispatchEvent(evt);
            }}
            onDrawMarker={() => {
              if (drawControlRef.current && mapRef.current) {
                // @ts-expect-error dddd
                drawControlRef.current._toolbars.draw._modes.marker.handler.enable();
              }
            }}
            onDrawPolyline={() => {
              if (drawControlRef.current && mapRef.current) {
                // @ts-expect-error dddddd
                drawControlRef.current._toolbars.draw._modes.polyline.handler.enable();
              }
            }}
            onZoomIn={() => {
              if (mapRef.current) {
                mapRef.current.zoomIn();
              }
            }}
            onZoomOut={() => {
              if (mapRef.current) {
                mapRef.current.zoomOut();
              }
            }}
            onFreehandDraw={() => {
              if (isFreehandDrawing) {
                resetFreehandDrawing();
              } else {
                setFreehandDrawing(true);
              }
            }}
            onMeasureDistance={() => {
              if (isMeasuring) {
                clearMeasurements();
              }
              setMeasuring(!isMeasuring);
            }}
            onUndoMeasurement={undoMeasurement}
            isFreehandDrawing={isFreehandDrawing}
            isMeasuring={isMeasuring}
            canUndo={canUndo}
            onLocateUser={getUserLocation}
            permissions={permissions}
          />
        </div>
      </div>

      <div className="leaflet-container-wrapper" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
          className="map-container"
          worldCopyJump={true}
          ref={(map) => {
            if (map && !mapRef.current) {
              mapRef.current = map;
            }
          }}
          whenReady={() => {
            if (mapRef.current && !onMapReadyCalledRef.current) {
              handleMapReady(mapRef.current);
            }
          }}
        >
          <TileLayer
            attribution={activeMapLayer.attribution}
            url={activeMapLayer.url}
            maxZoom={activeMapLayer.maxZoom}
          />
          
          <MapController 
            projectId={projectId}
            localMarkers={markers}
            localRoutes={routes}
            activeFeature={activeFeature}
            featureInfo={featureInfo}
            onInfoPanelVisibilityChange={(visible: boolean) => setShowInfoPanel(visible)}
            handleMarkerClick={handleMarkerClick}
            handleRouteClick={handleRouteClick}
            onMarkerCreate={addMarker}
            onRouteCreate={addRoute}
            onMarkerDelete={deleteMarker}
            onRouteDelete={deleteRoute}
            onFeatureSelect={(feature: Marker | Route | null, type: 'marker' | 'route' | null) => {
              if (feature) {
                setActiveFeature(feature);
              } else {
                setActiveFeature(null);
              }
            }}
            mapRef={mapRef}
            drawControlRef={drawControlRef}
            drawnItemsRef={drawnItemsRef}
            enableEditMode={enableEditMode}
            disableEditMode={disableEditMode}
            saveEditChanges={saveEditChanges}
            isSharedMode={isSharedMode} // Pass the read-only flag to disable drawing controls
            isFreehandDrawing={isFreehandDrawing}
            currentFreehandPath={currentFreehandPath}
            onFreehandPathUpdate={handleFreehandPathUpdate}
            onFreehandComplete={handleFreehandComplete}
            isMeasuring={isMeasuring}
            onMeasureClick={handleMeasureClick}
          />
      </MapContainer>
    </div>
    
    {showInfoPanel && (
      <FeatureInfoPanel
        featureInfo={featureInfo}
        projectId={projectId || 0}
        onClose={() => {
          disableEditMode();
          setShowInfoPanel(false);
          setIsEditMode(false);
        }}
        onSave={saveFeatureChanges}
        onDelete={deleteFeature}
        onChange={setFeatureInfo}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onEditModeChange={(isEdit) => {
          setIsEditMode(isEdit);
          if (isEdit && featureInfo.id) {
            enableEditMode(featureInfo.id);
          } else {
            disableEditMode();
          }
        }}
        isSharedMode={isSharedMode} // Pass read-only flag to disable editing controls
        isEditMode={isEditMode}
        onSaveEditChanges={saveEditChanges}
        onCancelEditChanges={disableEditMode}
        preloadedImages={isSharedMode && featureInfo.id ? imagesByFeature[`${featureInfo.type}_${featureInfo.id}`] : undefined}
      />
    )}
  </div>
);
};

export default MapComponent;

// Add CSS styles for measurement visibility
if (typeof window !== 'undefined') {
  const measureStyleId = 'measure-enhancement-style';
  if (!document.getElementById(measureStyleId)) {
    const style = document.createElement('style');
    style.id = measureStyleId;
    style.innerHTML = `
      .measure-label {
        pointer-events: none !important;
        z-index: 1000 !important;
      }
      .measure-label div {
        transform: translate(-50%, -50%);
        pointer-events: none !important;
        user-select: none !important;
      }

      /* Ensure measurement elements are always visible */
      .leaflet-measure-line {
        z-index: 800 !important;
      }

      .leaflet-measure-marker {
        z-index: 900 !important;
      }

      /* Improve cursor visibility in measure mode */
      .leaflet-container.measure-mode {
        cursor: crosshair !important;
      }

      /* Enhanced visibility for measurement labels on dark/light backgrounds */
      .leaflet-measure-label {
        background: transparent !important;
        color: #000000 !important;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9) !important;
        font-weight: bold !important;
        font-size: 12px !important;
        padding: 2px 4px !important;
        border-radius: 2px !important;
        white-space: nowrap !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}
