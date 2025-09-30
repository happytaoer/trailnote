'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { message } from 'antd';
import { markersApi, routesApi } from '@/lib/api';
import { Marker, Route } from '@/types';
import { MapControllerProps } from '@/types/map';
import * as turf from '@turf/turf';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedFeatureStore } from '@/stores';
import { throttle } from 'lodash';

// 导入 DefaultIcon
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// MapController component to handle map interactions
const MapController = ({
  projectId,
  localMarkers,
  localRoutes, 
  activeFeature,
  featureInfo,
  onInfoPanelVisibilityChange,
  handleMarkerClick,
  handleRouteClick,
  onMarkerCreate,
  onRouteCreate,
  onMarkerDelete,
  onRouteDelete,
  onFeatureSelect,
  drawControlRef,
  drawnItemsRef,
  isSharedMode = false, // Default to false (edit mode enabled)
  isFreehandDrawing = false,
  currentFreehandPath = [],
  onFreehandPathUpdate,
  onFreehandComplete,
  isMeasuring = false,
  onMeasureClick
}: MapControllerProps) => {
  const map = useMap();
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();
  const { setSelectedFeature } = useSelectedFeatureStore();

  /**
   * Handle marker click - update Zustand store and call parent handler
   */
  const handleMarkerClickInternal = (marker: Marker): void => {
    // Update Zustand store
    setSelectedFeature({ id: marker.id, type: 'marker' });
    // Call parent handler
    handleMarkerClick(marker);
  };

  /**
   * Handle route click - update Zustand store and call parent handler
   */
  const handleRouteClickInternal = (route: Route): void => {
    // Update Zustand store
    setSelectedFeature({ id: route.id, type: 'route' });
    // Call parent handler
    handleRouteClick(route);
  };

  /**
   * Check if the user has reached their marker limit based on subscription
   * @returns boolean indicating if marker limit is reached
   */
  const checkMarkerLimit = (): boolean => {
    const isPremium = user?.subscription?.subscriptionStatus === 'active';
    const maxMarkers = isPremium ? 90 : 30;
    
    if (localMarkers.length >= maxMarkers) {
      messageApi.error(
        isPremium
          ? `Premium plan limit: Maximum ${maxMarkers} markers per project`
          : `Free plan limit: Maximum ${maxMarkers} markers per project. Upgrade to Premium for up to 90 markers.`
      );
      return true;
    }
    return false;
  };
  
  /**
   * Check if the user has reached their route limit based on subscription
   * @returns boolean indicating if route limit is reached
   */
  const checkRouteLimit = (): boolean => {
    const isPremium = user?.subscription?.subscriptionStatus === 'active';
    const maxRoutes = isPremium ? 15 : 5;
    if (localRoutes.length >= maxRoutes) {
      messageApi.error(
        isPremium
          ? `Premium plan limit: Maximum ${maxRoutes} routes per project`
          : `Free plan limit: Maximum ${maxRoutes} routes per project. Upgrade to Premium for up to 15 routes.`
      );
      return true;
    }
    return false;
  };
  
  // Initialize scale control
  useEffect(() => {
    if (!map) return;

    // Add scale control to the map
    const scaleControl = L.control.scale({
      position: 'bottomright',
      imperial: false,
      maxWidth: 200
    }).addTo(map);

    // Cleanup on unmount
    return () => {
      // Remove scale control when component unmounts
      scaleControl.remove();
    };
  }, [map]); // Only re-run if map changes

  // Initialize draw control
  useEffect(() => {
    if (!map) return;

    // Initialize feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;
    
    // Only add draw controls if not in read-only mode
    if (!isSharedMode) {
      // Initialize draw control
      const drawControl = new L.Control.Draw({
        position: 'bottomleft',
        edit: {
          featureGroup: drawnItems,
          poly: {
            allowIntersection: false
          },
          remove: false,
          edit:false
        } as L.Draw.EditOptions,
        draw: {
          polygon: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: {
            icon: DefaultIcon
          } as L.Draw.DrawOptions.MarkerOptions, 
          polyline: {
            shapeOptions: {
              color: '#3887be',
              weight: 3
            }
          } as L.Draw.DrawOptions.PolylineOptions
        }
      });
      
      map.addControl(drawControl);
      drawControlRef.current = drawControl;
    }
    
    // Handle created events - only register if not in read-only mode
    if (!isSharedMode) {

      map.on(L.Draw.Event.CREATED, (e: any) => {
        if (!projectId) return;
        const layer = e.layer;
  
        drawnItems.addLayer(layer);

      if (e.layerType === 'polyline') {
        // Check route limit before proceeding
        if (checkRouteLimit()) {
          drawnItems.removeLayer(layer);
          return;
        }
        
        const latlngs = layer.getLatLngs();
        const coordinates = latlngs.map((latlng: L.LatLng) => {
          const wrappedLatLng = latlng.wrap(); // 使用 Leaflet 的 wrap() 方法标准化经度
          return [wrappedLatLng.lng, wrappedLatLng.lat];
        });
        
        // Get user's default route color, width, and opacity or fallback to defaults
        const defaultRouteColor = user?.settings?.route_color || '#3887be';
        const defaultRouteWidth = user?.settings?.route_width || '3';
        const defaultRouteOpacity = parseFloat(user?.settings?.route_opacity || '1.0');
        
        // Create GeoJSON from coordinates
        const geojson = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties: {
            color: defaultRouteColor,
            name: 'New Route'
          }
        };
        
        // Calculate route distance
        let distance = 0;
        if (coordinates.length > 1) {
          // Convert to turf format for distance calculation
          const line = turf.lineString(coordinates);
          distance = turf.length(line, { units: 'meters' });
        }

        // Create a new route
        const newRoute: Partial<Route> = {
          project_id: projectId,
          route_name: 'New Route',
          description: '',
          route_color: defaultRouteColor,
          route_width: defaultRouteWidth,
          route_opacity: defaultRouteOpacity,
          geojson: geojson,
          route_distance: distance,
          start_latitude: latlngs[0].lat,
          start_longitude: latlngs[0].wrap().lng,
          end_latitude: latlngs[latlngs.length - 1].lat,
          end_longitude: latlngs[latlngs.length - 1].wrap().lng,
          is_deleted: false
        };

        // Replace the original polyline with enhanced version (with hover effects)
        const replaceWithEnhancedPolyline = () => {
          // Remove the original layer
          drawnItems.removeLayer(layer);
          
          // Create coordinates for the enhanced polyline
          const coordinates = latlngs.map((latlng: L.LatLng) => [latlng.lat, latlng.lng] as [number, number]);
          const routeWidth = parseInt(defaultRouteWidth);
          
          // Create highlight polyline (wider, semi-transparent)
          const highlightPolyline = L.polyline(coordinates, {
            color: defaultRouteColor,
            weight: routeWidth + 6,
            opacity: 0,
            interactive: false
          });
          
          // Create main polyline
          const enhancedPolyline = L.polyline(coordinates, {
            color: defaultRouteColor,
            weight: routeWidth,
            opacity: 1.0
          });
          
          // Add hover effects
          enhancedPolyline.on('mouseover', () => {
            highlightPolyline.setStyle({
              opacity: 0.3
            });
          });
          
          enhancedPolyline.on('mouseout', () => {
            highlightPolyline.setStyle({
              opacity: 0
            });
          });
          
          // Add both layers to drawn items
          drawnItems.addLayer(highlightPolyline);
          drawnItems.addLayer(enhancedPolyline);
          
          return enhancedPolyline;
        };
        
        // Replace with enhanced polyline immediately
        const enhancedLayer = replaceWithEnhancedPolyline();

        // Save route to database
        const saveRoute = async () => {
          try {
            const newRouteData = await routesApi.createRoute(newRoute);
            
            // Store route ID in the enhanced layer
            (enhancedLayer as any)._ID = newRouteData.id;
            
            // Add click handler to the enhanced layer
            enhancedLayer.on('click', () => {
              handleRouteClickInternal(newRouteData);
            });
            
            if (onRouteCreate) {
              onRouteCreate(newRouteData);
            }
            
            // Open edit panel for new route
            handleRouteClickInternal(newRouteData);
          } catch (error) {
            messageApi.error('Error saving route');
          }
        };

        saveRoute();
      } else if (e.layerType === 'marker') {
        // Check marker limit before proceeding
        if (checkMarkerLimit()) {
          drawnItems.removeLayer(layer);
          return;
        }
        
        // Handle marker creation from the draw tool
        const latlng = layer.getLatLng();
  
        // Create a new marker
        const newMarker: Partial<Marker> = {
          project_id: projectId,
          marker_name: 'New Marker',
          marker_description: '',
          latitude: latlng.lat,
          longitude: latlng.wrap().lng,
          geojson: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [latlng.wrap().lng, latlng.lat]
            },
            properties: {
              name: 'New Marker'
            }
          },
          is_deleted: false
        };

        // Save marker to database
        const saveMarker = async () => {
          try {
            const newMarkerData = await markersApi.createMarker(newMarker);
            
            if (onMarkerCreate) {
              onMarkerCreate(newMarkerData);
            }
            
            // Open edit panel for new marker
            handleMarkerClickInternal(newMarkerData);
          } catch (error) {
            messageApi.error('Error saving marker');
          }
        };

        saveMarker();
      }
    });
    
    // Handle deleted events
    map.on(L.Draw.Event.DELETED, (e: any) => {
      if (!projectId) return;
      
      const layers = e.layers;
      
      layers.eachLayer(async (layer: any) => {
        // Get the ID of the deleted feature
        const featureId = layer._ID;
        
        if (!featureId) {
          messageApi.error('Failed to find feature ID to delete');
          return;
        }
        
        // Check if it's a marker or a polyline
        if (layer instanceof L.Marker) {
          // Handle marker deletion
          try {
            // Delete from database
            await markersApi.deleteMarker(featureId);
            
            if (onMarkerDelete) {
              onMarkerDelete(featureId);
            }

            // Close info panel if the deleted marker is currently selected
            if (activeFeature && activeFeature.id === featureId && featureInfo.type === 'marker') {
              // Notify parent component to close info panel
              if (onInfoPanelVisibilityChange) {
                onInfoPanelVisibilityChange(false);
              }
              // Notify parent component that no feature is selected
              if (onFeatureSelect) {
                onFeatureSelect(null as any, 'marker');
              }
            }
          } catch (error) {
            messageApi.error('Failed to delete marker');
          }
        } else if (layer instanceof L.Polyline) {
          // Handle polyline deletion
          try {
            // Delete from database
            await routesApi.deleteRoute(featureId);
            
            if (onRouteDelete) {
              onRouteDelete(featureId);
            }
            
            // Close info panel if the deleted route is currently selected
            if (activeFeature && activeFeature.id === featureId && featureInfo.type === 'route') {
              // Notify parent component to close info panel
              if (onInfoPanelVisibilityChange) {
                onInfoPanelVisibilityChange(false);
              }
              // Notify parent component that no feature is selected
              if (onFeatureSelect) {
                onFeatureSelect(null as any, 'route');
              }
            }
          } catch (error) {
            messageApi.error('Failed to delete route');
          }
        }
      });
    });
    }
    
    // Cleanup on unmount
    return () => {
      // Only remove control if it exists (not in read-only mode)
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      
      // Remove feature group if it exists
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
      }
      
      // Remove all event listeners
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.EDITED);
      map.off(L.Draw.Event.DELETESTART);
      map.off(L.Draw.Event.DELETESTOP);
      map.off(L.Draw.Event.DELETED);
      
      // Note: Scale control is automatically removed when the map is destroyed
    };
  }, [map, projectId, localMarkers, localRoutes, isSharedMode]);
  
  // Add existing markers and routes to the drawn items layer
  useEffect(() => {
    if (!map || !drawnItemsRef.current) return;
    
    // Clear existing items
    drawnItemsRef.current.clearLayers();
    
    // Add markers to the drawn items layer
    localMarkers.forEach((marker: Marker) => {
      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: DefaultIcon });
      
      // Add tooltip to the marker
      const markerTooltipContent = `
        <div style="display: flex; align-items: center;">
          <strong style="white-space: nowrap;">${marker.marker_name}</strong>
          ${!isSharedMode && marker.status === 'visited' 
            ? '<span style="margin-left: 8px;" title="Visited"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" fill="green" style="vertical-align: -2px;"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-277.02 97.941l184-184c4.686-4.686 4.686-12.284 0-16.97l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0L216 284.117l-70.059-70.059c-4.686-4.686-12.284-4.686-16.97 0L100.686 242.343c-4.686 4.686-4.686 12.284 0 16.97l96 96c4.686 4.686 12.284 4.686 16.97 0z"/></svg></span>' 
            : !isSharedMode && marker.status === 'not_visited' 
            ? '<span style="margin-left: 8px;" title="Not Visited"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" fill="orange" style="vertical-align: -2px;"><path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm122.627 313.373c4.686 4.686 4.686 12.284 0 16.97l-39.314 39.314c-4.686 4.686-12.284 4.686-16.97 0L256 312.971l-66.343 66.343c-4.686 4.686-12.284 4.686-16.97 0l-39.314-39.314c-4.686-4.686-4.686-12.284 0-16.97L199.029 256l-66.343-66.343c-4.686-4.686-4.686-12.284 0-16.97l39.314-39.314c4.686-4.686 12.284-4.686 16.97 0L256 199.029l66.343-66.343c4.686-4.686 12.284-4.686 16.97 0l39.314 39.314c4.686 4.686 4.686 12.284 0 16.97L312.971 256l66.343 66.343z"/></svg></span>' 
            : ''}
        </div>
      `;
      leafletMarker.bindTooltip(markerTooltipContent, {
        permanent: true,
        direction: 'top',
        offset: [0, -40],
        className: 'marker-tooltip'
      });
      
      // Add click handler
      leafletMarker.on('click', () => {
        handleMarkerClickInternal(marker);
      });
      
      // Store marker ID as a custom property
      (leafletMarker as any)._ID = marker.id;
      
      // Add to drawn items
      drawnItemsRef.current!.addLayer(leafletMarker);
    });
    
    // Add routes to the drawn items layer
    localRoutes.forEach((route: Route) => {
      if (route.geojson?.geometry?.coordinates?.length > 0) {
        const coordinates = route.geojson.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        
        const routeWidth = parseInt(route.route_width) || 3;
        const routeColor = route.route_color || '#3887be';
        const routeOpacity = route.route_opacity ?? 1.0;
        
        // Create highlight polyline (wider, semi-transparent)
        const highlightPolyline = L.polyline(coordinates, {
          color: routeColor,
          weight: routeWidth + 6,
          opacity: 0,
          interactive: false
        });
        
        // Create main polyline
        const polyline = L.polyline(coordinates, {
          color: routeColor,
          weight: routeWidth,
          opacity: routeOpacity
        });
        
        // Add tooltip to the route
        const distanceInKm = route.route_distance / 1000;
        const tooltipContent = `
          <div>
            <div style="display: flex; align-items: center;">
              <strong style="white-space: nowrap;">${route.route_name}</strong>
              ${route.status === 'visited' 
                ? '<span style="margin-left: 8px;" title="Visited"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" fill="green" style="vertical-align: -2px;"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-277.02 97.941l184-184c4.686-4.686 4.686-12.284 0-16.97l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0L216 284.117l-70.059-70.059c-4.686-4.686-12.284-4.686-16.97 0L100.686 242.343c-4.686 4.686-4.686 12.284 0 16.97l96 96c4.686 4.686 12.284 4.686 16.97 0z"/></svg></span>' 
                : route.status === 'not_visited' 
                ? '<span style="margin-left: 8px;" title="Not Visited"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" fill="orange" style="vertical-align: -2px;"><path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm122.627 313.373c4.686 4.686 4.686 12.284 0 16.97l-39.314 39.314c-4.686 4.686-12.284 4.686-16.97 0L256 312.971l-66.343 66.343c-4.686 4.686-12.284 4.686-16.97 0l-39.314-39.314c-4.686-4.686-4.686-12.284 0-16.97L199.029 256l-66.343-66.343c-4.686-4.686-4.686-12.284 0-16.97l39.314-39.314c4.686-4.686 12.284-4.686 16.97 0L256 199.029l66.343-66.343c4.686-4.686 12.284-4.686 16.97 0l39.314 39.314c4.686 4.686 4.686 12.284 0 16.97L312.971 256l66.343 66.343z"/></svg></span>' 
                : ''}
            </div>
            <span style="color: #555; font-size: 0.9em;">${distanceInKm.toFixed(2)} km</span>
          </div>
        `;
        
        polyline.bindTooltip(tooltipContent, {
          permanent: true,
          direction: 'center',
          className: 'route-tooltip'
        });
        
        // Add hover effects
        polyline.on('mouseover', () => {
          highlightPolyline.setStyle({
            opacity: 0.3
          });
        });
        
        polyline.on('mouseout', () => {
          highlightPolyline.setStyle({
            opacity: 0
          });
        });
        
        // Add click handler
        polyline.on('click', () => {
          handleRouteClickInternal(route);
        });
        
        // Store route ID as a custom property
        (polyline as any)._ID = route.id;
        (highlightPolyline as any)._ID = route.id;
      
        // Add both layers to drawn items (highlight first, then main polyline)
        drawnItemsRef.current!.addLayer(highlightPolyline);
        drawnItemsRef.current!.addLayer(polyline);
      }
    });
  }, [localMarkers, localRoutes, map]);
  
  // Handle freehand drawing events
  useEffect(() => {
    if (!map || isSharedMode) return;

    let isDrawing = false;
    let currentPath: L.LatLng[] = [];
    let tempPolyline: L.Polyline | null = null;

    // Throttled path update function for better performance
    const throttledPathUpdate = throttle((path: L.LatLng[]) => {
      if (onFreehandPathUpdate) {
        onFreehandPathUpdate(path);
      }
    }, 300); // 300ms throttle to reduce performance impact

    const handleMouseDown = (e: L.LeafletMouseEvent) => {
      if (!isFreehandDrawing) return;

      isDrawing = true;
      currentPath = [e.latlng];

      // Create temporary polyline for visual feedback
      tempPolyline = L.polyline([e.latlng], {
        color: user?.settings?.route_color || '#3887be',
        weight: parseInt(user?.settings?.route_width || '3'),
        opacity: parseFloat(user?.settings?.route_opacity || '1.0'),
        dashArray: '5, 5' // Dashed line to indicate it's temporary
      }).addTo(map);

      // Disable map dragging during drawing
      map.dragging.disable();
      map.doubleClickZoom.disable();

      e.originalEvent.preventDefault();
    };

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!isFreehandDrawing || !isDrawing || !tempPolyline) return;

      currentPath.push(e.latlng);
      tempPolyline.setLatLngs(currentPath);

      // Update parent component with throttled path updates
      throttledPathUpdate([...currentPath]);
    };

    const handleMouseUp = (e: L.LeafletMouseEvent) => {
      if (!isFreehandDrawing || !isDrawing) return;

      isDrawing = false;

      // Re-enable map interactions
      map.dragging.enable();
      map.doubleClickZoom.enable();

      // Remove temporary polyline
      if (tempPolyline) {
        map.removeLayer(tempPolyline);
        tempPolyline = null;
      }

      // Cancel any pending throttled updates
      throttledPathUpdate.cancel();

      // Complete the freehand drawing if we have enough points
      if (currentPath.length >= 2 && onFreehandComplete) {
        onFreehandComplete([...currentPath]);
      }

      currentPath = [];
    };

    // Add event listeners when freehand drawing is enabled
    if (isFreehandDrawing) {
      map.on('mousedown', handleMouseDown);
      map.on('mousemove', handleMouseMove);
      map.on('mouseup', handleMouseUp);

      // Change cursor to indicate drawing mode
      map.getContainer().style.cursor = 'crosshair';
    } else {
      // Reset cursor
      map.getContainer().style.cursor = '';
    }

    // Cleanup function
    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);

      // Cancel throttled function
      throttledPathUpdate.cancel();

      // Clean up temporary polyline if it exists
      if (tempPolyline) {
        map.removeLayer(tempPolyline);
      }

      // Re-enable map interactions
      map.dragging.enable();
      map.doubleClickZoom.enable();

      // Reset cursor
      map.getContainer().style.cursor = '';
    };
  }, [map, isFreehandDrawing, onFreehandPathUpdate, onFreehandComplete, user?.settings, isSharedMode]);

  // Handle measuring events
  useEffect(() => {
    if (!map || isSharedMode) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isMeasuring || !onMeasureClick) return;
      
      // Prevent event from bubbling to other handlers
      e.originalEvent.stopPropagation();
      
      // Call the measure click handler
      onMeasureClick(e.latlng);
    };

    // Add event listeners when measuring is enabled
    if (isMeasuring) {
      map.on('click', handleMapClick);
      
      // Change cursor to indicate measuring mode
      map.getContainer().style.cursor = 'crosshair';
      map.getContainer().classList.add('measure-mode');
    } else {
      // Reset cursor
      map.getContainer().style.cursor = '';
      map.getContainer().classList.remove('measure-mode');
    }

    // Cleanup function
    return () => {
      map.off('click', handleMapClick);
      
      // Reset cursor
      map.getContainer().style.cursor = '';
    };
  }, [map, isMeasuring, onMeasureClick, isSharedMode]);

  return <>{contextHolder}</>;
};

export default MapController;

// Hide the default Leaflet.Draw toolbar
if (typeof window !== 'undefined') {
  const styleId = 'leaflet-draw-toolbar-hide';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .leaflet-draw-toolbar {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

