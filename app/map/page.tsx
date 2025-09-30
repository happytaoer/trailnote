'use client';

import { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/authService';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useProjectStore, useMapStore } from '@/stores';
import { calculateMapCenter } from '@/utils/map-utils';

// Dynamically import MapBox components to avoid SSR issues

const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), {
  ssr: false,
      loading: () => <Spin size="large" tip="Loading Map..." fullscreen />
});

export default function MapPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(416); // Default width (26rem = 416px)
  const [initialMapCenter, setInitialMapCenter] = useState<[number, number] | null>(null);


  // Get stores state and actions
  const {
    selectedProject,
    isLoading,
    loadProjects,
    setIsLoading
  } = useProjectStore();
  
  const {
    loadMapData,
    clearMapData
  } = useMapStore();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/');
      } else {
        setAuthChecked(true);
        loadProjects().catch((error) => {
          messageApi.error(`Error loading projects: ${error.message}`);
        });
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchDataForProject = async () => {
      if (selectedProject) {
        try {
          const { markers, routes } = await loadMapData(selectedProject.id);
          // Calculate map center using utility function
          const center = await calculateMapCenter(markers, routes);
          setInitialMapCenter(center);
        } catch (error: any) {
          messageApi.error(error.message);
        }
      } else {
        // Clear map data when no project is selected
        clearMapData();
        setInitialMapCenter(null);
      }
    };

    fetchDataForProject();
  }, [selectedProject?.id, loadMapData, clearMapData]);

  const handleToggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };



  return (
    <div className="relative w-full h-screen overflow-hidden">
      {contextHolder}
      {/* Map Container */}
      <div className="w-full h-full">
        {!isLoading && authChecked && (
          <MapComponent
          projectId={selectedProject?.id || null}
          initialCenter={initialMapCenter}
          sidebarCollapsed={sidebarCollapsed}
          sidebarWidth={sidebarWidth}
        />
        )}
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        isLoading={isLoading}
        onIsLoadingChange={setIsLoading}
        onWidthChange={setSidebarWidth}
      />

    </div>
  );
}
