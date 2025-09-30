'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message } from 'antd';
import dynamic from 'next/dynamic';
import { calculateMapCenter } from '@/utils/map-utils';
import { useSharedMapStore } from '@/stores';

// Dynamically import MapBox components to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center">Loading Map...</div>
});

import Sidebar from '@/components/Sidebar/Sidebar';

/**
 * SharedProjectPage displays a shared project with interactive map
 */
const SharedProjectPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  
  // Sidebar state management for shared mode
  
  // Use shared map store
  const {
    project,
    markers,
    routes,
    imagesByFeature,
    isLoading: loading,
    error,
    initialMapCenter,
    setProject,
    setMarkers,
    setRoutes,
    setImagesByFeature,
    setInitialMapCenter,
    setLoading,
    setError,
    clearSharedData
  } = useSharedMapStore();

  
  useEffect(() => {
    const fetchSharedProject = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        if (!params.id) {
          throw new Error('Project ID not provided');
        }
        
        try {
          // Get all project data from the consolidated API endpoint
          const response = await fetch(`/api/share?id=${params.id}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load shared project');
          }
          
          // The API now returns project, markers, routes, and images in one response
          const sharedData = await response.json();
          
          // If the project exists but is not shared, redirect to home page
          if (!sharedData.project.is_shared) {
            router.push('/');
            return;
          }
          
          // Update store with fetched data
          setProject(sharedData.project);
          setMarkers(sharedData.markers || []);
          setRoutes(sharedData.routes || []);
          setImagesByFeature(sharedData.imagesByFeature || {});

          // Calculate the map center based on markers and routes
          const center = await calculateMapCenter(sharedData.markers || [], sharedData.routes || []);
          if (center) {
            setInitialMapCenter(center);
          }
        } catch (err: any) {
          // Handle specific error for projects that are not shared
          if (err.message === 'This project is not shared') {
            router.push('/');
            return;
          }
          throw err; // Re-throw other errors to be caught by the outer catch block
        }
      } catch (err: any) {
        console.error('Error fetching shared project data:', err);
        setError(err.message || 'Failed to load shared project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedProject();
    
    // Cleanup on unmount
    return () => {
      clearSharedData();
    };
  }, [params.id, router, setLoading, setError, setProject, setMarkers, setRoutes, setImagesByFeature, setInitialMapCenter, clearSharedData]);
  
  const toggleSidebar = (): void => {
    setShowSidebar(!showSidebar);
  };

  
  if (loading) {
    return <Spin fullscreen tip="Loading shared project..." />;
  }
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {contextHolder}
      
      {/* Map Container */}
      <div className="w-full h-full">
        <MapComponent 
          projectId={project ? project.id : null}
          initialCenter={initialMapCenter}
          sidebarCollapsed={!showSidebar}
          isSharedMode={true} // Set to true for shared projects
          permissions={{
            canSelectMapLayer: false,
            canDrawMarker: false,
            canDrawPolyline: false,
            canFreehandDraw: false,
            canMeasureDistance: true,
            canZoom: true,
            canLocate: false
          }}
          imagesByFeature={imagesByFeature} // Pass the pre-loaded images
        />
      </div>

      <Sidebar
        collapsed={!showSidebar}
        onToggleCollapse={toggleSidebar}
        showUserSection={false}
        isLoading={loading}
        onIsLoadingChange={() => {}} // No-op for shared mode
        isSharedMode={true}
        sharedProject={project}
        imagesByFeature={imagesByFeature}
      />
    </div>
  );
};

export default SharedProjectPage;
