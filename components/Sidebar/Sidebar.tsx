'use client';

import { useState, useEffect } from 'react';
import { Marker, Route, Project, Image } from '@/types';
import { useProjectStore, useMapStore, useSharedMapStore } from '@/stores';
import UserSection from './UserSection';
import FeatureList from './FeatureList';
import ProjectCard from './ProjectCard';
import SidebarHeader from './SidebarHeader';
import ResizableSidebar from './ResizableSidebar';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  showUserSection?: boolean;
  isLoading: boolean;
  onIsLoadingChange: (loading: boolean) => void;
  onWidthChange?: (width: number) => void;
  // Shared mode props
  isSharedMode?: boolean;
  sharedProject?: Project;
  imagesByFeature?: Record<string, Image[]>;
}

const Sidebar = ({
  collapsed,
  onToggleCollapse,
  showUserSection = true,
  isLoading,
  onIsLoadingChange,
  onWidthChange,
  isSharedMode = false,
  sharedProject,
  imagesByFeature = {}
}: SidebarProps) => {
  // Get stores state and actions (only for non-shared mode)
  const {
    selectedProject: storeSelectedProject,
    setSelectedProject
  } = useProjectStore();
  
  // Use different stores based on shared mode
  const mapStore = useMapStore();
  const sharedMapStore = useSharedMapStore();
  
  const {
    markers,
    routes,
    deleteMarker,
    deleteRoute
  } = isSharedMode ? {
    markers: sharedMapStore.markers,
    routes: sharedMapStore.routes,
    deleteMarker: () => {}, // No-op in shared mode
    deleteRoute: () => {} // No-op in shared mode
  } : mapStore;

  // Determine which project to use based on mode
  const currentProject = isSharedMode ? sharedProject : storeSelectedProject;

  // Track previous project id to detect project changes
  const [prevProjectId, setPrevProjectId] = useState<number | null>(null);


  useEffect(() => {
    // Skip loading management in shared mode
    if (isSharedMode) {
      return;
    }
    
    // If selected project changed, set loading state to true
    if (currentProject && prevProjectId !== currentProject.id) {
      onIsLoadingChange(true);
      setPrevProjectId(currentProject.id);
      
      // Simulate loading delay to ensure skeleton is visible
      const timer = setTimeout(() => {
        onIsLoadingChange(false);
      }, 500); // Short delay to ensure skeleton is visible
      
      return () => clearTimeout(timer);
    } else if (!currentProject) {
      // No selected project
      onIsLoadingChange(false);
      setPrevProjectId(null);
    }
  }, [currentProject, onIsLoadingChange, isSharedMode]);


  // Both shared mode and regular mode use resizable sidebar
  return (
    <>
      <ResizableSidebar
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        onWidthChange={onWidthChange}
        minWidth={300}
        maxWidth={800}
        defaultWidth={416}
      >
        <SidebarHeader/>

        {/* Fixed top section with project selector and search */}
        <div className="px-4 pt-0 flex flex-col">
          {isSharedMode ? (
            <ProjectCard 
              isLoading={isLoading} 
              isSharedMode={true} 
              sharedProject={sharedProject!} 
            />
          ) : (
            <ProjectCard
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col">
          {currentProject && (
            <FeatureList
              markers={markers}
              routes={routes}
              isLoading={isLoading}
              isSharedMode={isSharedMode}
              imagesByFeature={imagesByFeature}
            />
          )}
        </div>
        
        {showUserSection && !isSharedMode && (
          <div className="p-0 border-t border-gray-200">
            <UserSection />
          </div>
        )}
      </ResizableSidebar>
    </>
  );
};

export default Sidebar;
