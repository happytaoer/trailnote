'use client';

import { useState, useEffect } from 'react';
import { Marker, Route, Project, Image } from '@/types';
import { useProjectStore, useMapStore, useSharedMapStore, useSelectedFeatureStore } from '@/stores';
import { Tabs, Badge, Button, Tooltip } from 'antd';
import { EnvironmentOutlined, NodeIndexOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import UserSection from './UserSection';
import FeatureList from './FeatureList';
import ProjectCard from './ProjectCard';
import SidebarHeader from './SidebarHeader';
import ResizableSidebar from './ResizableSidebar';
import FeatureSearch from './FeatureSearch';

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

  // Search and filter state management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'visited' | 'not_visited' | null>(null);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState<string>('markers');
  const [isManualTabSwitch, setIsManualTabSwitch] = useState<boolean>(false);
  const [lastSelectedFeatureId, setLastSelectedFeatureId] = useState<number | null>(null);
  
  // Sorting state management
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Get selected feature from store for auto tab switching
  const { selectedFeature } = useSelectedFeatureStore();


  // Auto switch tab based on selected feature (only if not manually switched or new feature selected)
  useEffect(() => {
    if (selectedFeature) {
      const isNewFeatureSelection = selectedFeature.id !== lastSelectedFeatureId;
      
      if (isNewFeatureSelection) {
        // Reset manual switch flag when a new feature is selected
        setIsManualTabSwitch(false);
        setLastSelectedFeatureId(selectedFeature.id);
      }
      
      // Auto switch only if not manually switched or it's a new feature selection
      if (!isManualTabSwitch || isNewFeatureSelection) {
        const targetTab = selectedFeature.type === 'marker' ? 'markers' : 'routes';
        if (activeTab !== targetTab) {
          setActiveTab(targetTab);
        }
      }
    }
  }, [selectedFeature, activeTab, isManualTabSwitch, lastSelectedFeatureId]);

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

  // Handle manual tab change
  const handleTabChange = (key: string): void => {
    setIsManualTabSwitch(true);
    setActiveTab(key);
  };

  // Handle search and filter changes
  const handleSearchChange = (query: string): void => {
    setSearchQuery(query);
  };

  const handleStatusFilterChange = (status: 'visited' | 'not_visited' | null): void => {
    setStatusFilter(status);
  };

  // Handle sort direction toggle
  const toggleSort = (): void => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Render sort button
  const renderSortButton = (): React.ReactNode => {
    return (
      <Tooltip title={`Sort by name (${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`}>
        <Button 
          type="text"
          size="small"
          icon={sortDirection === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
          onClick={toggleSort}
        />
      </Tooltip>
    );
  };


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

        {/* Fixed top section with project selector, search and tabs */}
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
          
          {/* Search and Tabs - Fixed position */}
          {currentProject && (
            <div className="space-y-3">
              <FeatureSearch
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                isSharedMode={isSharedMode}
              />
              
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                size="small"
                tabBarExtraContent={renderSortButton()}
                items={[
                  {
                    key: 'markers',
                    label: (
                      <span className="flex items-center gap-1">
                        <EnvironmentOutlined />
                        Places
                        <Badge 
                          count={markers.length} 
                          size="small" 
                          style={{ backgroundColor: '#52c41a' }} 
                        />
                      </span>
                    ),
                  },
                  {
                    key: 'routes',
                    label: (
                      <span className="flex items-center gap-1">
                        <NodeIndexOutlined />
                        Routes
                        <Badge 
                          count={routes.length} 
                          size="small" 
                          style={{ backgroundColor: '#1890ff' }} 
                        />
                      </span>
                    ),
                  },
                ]}
              />
            </div>
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
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              activeTab={activeTab}
              sortDirection={sortDirection}
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
