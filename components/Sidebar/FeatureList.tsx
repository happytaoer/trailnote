'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Marker, Route, Image } from '@/types';
import { Typography, Empty, Space, Skeleton, Card } from 'antd';
import FeatureItem from './FeatureItem';
import { useSelectedFeatureStore } from '@/stores';

interface FeatureListProps {
  markers: Marker[];
  routes: Route[];
  isLoading?: boolean;
  isSharedMode?: boolean;
  imagesByFeature?: Record<string, Image[]>;
  searchQuery: string;
  statusFilter: 'visited' | 'not_visited' | null;
  activeTab: string;
  sortDirection: 'asc' | 'desc';
}

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

const FeatureList: React.FC<FeatureListProps> = React.memo(({
  markers,
  routes,
  isLoading = false,
  isSharedMode = false,
  imagesByFeature = {},
  searchQuery,
  statusFilter,
  activeTab,
  sortDirection
}) => {
  const { Text } = Typography;
  const isMountedRef = useRef(true);
  
  // Use Zustand store for selection state management and map focus
  const { selectedFeature, setSelectedFeature, isFeatureSelected, setFeatureToFocus } = useSelectedFeatureStore();
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Internal handlers - now directly handle map focus via Zustand
  const handleFeatureClick = (feature: Marker | Route, type: 'marker' | 'route'): void => {
    // Update Zustand selection state
    setSelectedFeature({id: feature.id, type});
    // Trigger map focus via Zustand store
    setFeatureToFocus({ feature, type, openInEditMode: false });
  };

  const handleEditFeature = (feature: Marker | Route, type: 'marker' | 'route'): void => {
    // Update Zustand selection state
    setSelectedFeature({id: feature.id, type});
    // Trigger map focus in edit mode via Zustand store
    setFeatureToFocus({ feature, type, openInEditMode: true });
  };

  
  // Filter markers based on search query and status filter
  const filteredMarkers = useMemo(() => {
    let filtered = markers;
    
    // Apply text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(marker => 
        marker.marker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (marker.marker_description && marker.marker_description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter if set
    if (statusFilter) {
      filtered = filtered.filter(marker => marker.status === statusFilter);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      const nameA = a.marker_name.toLowerCase();
      const nameB = b.marker_name.toLowerCase();
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB) 
        : nameB.localeCompare(nameA);
    });
  }, [markers, searchQuery, statusFilter, sortDirection]);
  
  const filteredRoutes = useMemo(() => {
    let filtered = routes;
    
    // Apply text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(route => 
        route.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route.description && route.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter if set
    if (statusFilter) {
      filtered = filtered.filter(route => route.status === statusFilter);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      const nameA = a.route_name.toLowerCase();
      const nameB = b.route_name.toLowerCase();
      return sortDirection === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [routes, searchQuery, statusFilter, sortDirection]);
  

  // Render skeleton loading UI
  const renderSkeletons = (count: number = 3): React.ReactNode => {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} styles={{ body: { padding: 12 } }} style={{ position: 'relative' }}>
            <Space style={{ position: 'absolute', right: 12, top: 12 }}>
              {/* <Skeleton.Button style={{ width: 32, height: 24 }} active size="small" /> */}
              <Skeleton.Button style={{ width: 24, height: 24 }} active size="small" />
            </Space>
            <div>
              <Skeleton.Input style={{ width: 100, marginBottom: 12 }} active size="small" />
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </div>
          </Card>
        ))}
      </Space>
    );
  };

  // Render places list
  const renderMarkers = (): React.ReactNode => {
    if (isLoading) {
      return renderSkeletons();
    }

    if (markers.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={1}>
              <Text>No places added yet</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>Click on the map to add places you want to visit</Text>
            </Space>
          }
        />
      );
    }

    if (filteredMarkers.length === 0 && (searchQuery || statusFilter)) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={1}>
              <Text>No matching places found</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {statusFilter ? 'No places with this status filter' : 'Try searching with different keywords'}
              </Text>
            </Space>
          }
        />
      );
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {filteredMarkers.map((marker) => (
          <FeatureItem
            key={marker.id}
            feature={marker}
            type="marker"
            isSelected={isFeatureSelected(marker.id, 'marker')}
            onClick={() => handleFeatureClick(marker, 'marker')}
            onEdit={isSharedMode ? undefined : () => handleEditFeature(marker, 'marker')}
            isSharedMode={isSharedMode}
          />
        ))}
      </Space>
    );
  };

  // Render routes list
  const renderRoutes = (): React.ReactNode => {
    if (isLoading) {
      return renderSkeletons();
    }
    
    if (routes.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={1}>
              <Text>No routes planned yet</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>Use the route tool to draw your travel routes</Text>
            </Space>
          }
        />
      );
    }
    
    if (filteredRoutes.length === 0 && (searchQuery || statusFilter)) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={1}>
              <Text>No matching routes found</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {statusFilter ? 'No routes with this status filter' : 'Try searching with different keywords'}
              </Text>
            </Space>
          }
        />
      );
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {filteredRoutes.map((route) => (
          <FeatureItem
            key={route.id}
            feature={route}
            type="route"
            isSelected={isFeatureSelected(route.id, 'route')}
            onClick={() => handleFeatureClick(route, 'route')}
            onEdit={isSharedMode ? undefined : () => handleEditFeature(route, 'route')}
            isSharedMode={isSharedMode}
            />
        ))}
      </Space>
    );
  };


  // Always use filtered counts to reflect both search query and status filter
  const placesCount: number = filteredMarkers.length;
  const routesCount: number = filteredRoutes.length;
  
  // Render a skeleton for the tabs when loading
  if (isLoading) {
    return (
      <div className="feature-tabs-skeleton">
        <div className="tab-bar-skeleton" style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <Skeleton.Button active size="small" style={{ width: '80px', marginRight: '16px' }} />
          <Skeleton.Button active size="small" style={{ width: '80px' }} />
        </div>
        <div>
          {renderSkeletons(4)}
        </div>
      </div>
    );
  }


  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'markers') {
      return renderMarkers();
    } else {
      return renderRoutes();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
});

// Set display name for React DevTools
FeatureList.displayName = 'FeatureList';

export default FeatureList;
