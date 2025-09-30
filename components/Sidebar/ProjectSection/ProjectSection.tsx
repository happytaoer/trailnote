'use client';

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { Project } from '@/types';
import { useProjectStore } from '@/stores/useProjectStore';

// Import child components
import ProjectList from './components/ProjectList';
import ProjectSearchBar from './components/ProjectSearchBar';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import DeleteProjectModal from './components/DeleteProjectModal';

const ProjectSection: React.FC = () => {
  // Get project store state and actions
  const {
    projects,
    selectedProject,
    setSelectedProject,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingProject,
    deletingProject,
    openCreateModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal
  } = useProjectStore();
  const [messageApi, contextHolder] = message.useMessage();
  
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // State for pagination
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  
  
  
  // Handle paginated projects and filtering
  useEffect(() => {
    // If there's a search query, don't apply local filtering
    if (searchQuery.trim() !== '') return;
    
    // Filter projects by status if status filter is set
    let filtered = projects;
    if (statusFilter) {
      filtered = projects.filter(project => project.status === statusFilter);
    }
    
    // Set the filtered projects
    setDisplayedProjects(filtered);
  }, [projects, searchQuery, statusFilter]);

  // Search projects - use local filtering
  const searchProjects = (query: string) => {
    setIsSearching(true);
    
    // Filter projects locally
    let filteredData = projects.filter(project => 
      project.project_name.toLowerCase().includes(query.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Apply status filter to search results if needed
    if (statusFilter) {
      filteredData = filteredData.filter(project => project.status === statusFilter);
    }
    
    setSearchResults(filteredData);
    setTotalSearchResults(filteredData.length);
    setIsSearching(false);
  };

  // Use debounce to handle search requests when search query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProjects(searchQuery);
      } else {
        setSearchResults([]);
        setTotalSearchResults(0);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, projects, statusFilter]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status);
  };

return (
  <>
    {contextHolder}
    {/* Fixed header section */}
    <div style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 10, 
      backgroundColor: 'var(--background-color, #fff)', 
      paddingBottom: 1,
    }}>
      {/* Search section with integrated New Project button */}
      <ProjectSearchBar 
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onCreateProject={openCreateModal}
      />
    </div>

    {/* Only render ProjectList if we have projects to display */}
    {(searchQuery.trim() !== '' ? searchResults.length > 0 : displayedProjects.length > 0) && (
      <>
        <ProjectList 
          projects={searchQuery.trim() !== '' ? searchResults : displayedProjects}
        />
      </>
    )}
     
    {/* Create project modal */}
    <CreateProjectModal 
      open={showCreateModal}
      onCancel={closeCreateModal}
    />
    
    {/* Edit project modal */}
    <EditProjectModal 
      open={showEditModal}
      project={editingProject}
      onCancel={closeEditModal}
    />
    
    {/* Delete confirmation modal */}
    <DeleteProjectModal 
      open={showDeleteModal}
      project={deletingProject}
      onCancel={closeDeleteModal}
    />
    
  </>
);
};

export default ProjectSection;
