import { create } from 'zustand';
import { Project } from '@/types';
import { projectsApi } from '@/lib/api';

interface ProjectState {
  // State
  projects: Project[];
  selectedProject: Project | null;
  totalProjects: number;
  isLoading: boolean;

  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showShareModal: boolean;
  editingProject: Project | null;
  deletingProject: Project | null;
  sharingProject: Project | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setTotalProjects: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Modal actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (project: Project) => void;
  closeEditModal: () => void;
  openDeleteModal: (project: Project) => void;
  closeDeleteModal: () => void;
  openShareModal: (project: Project) => void;
  closeShareModal: () => void;
  
  // Async actions
  loadProjects: () => Promise<void>;
  createProject: (
    projectName: string,
    description?: string,
    status?: string,
    coverImageUrl?: string,
    coverImageStoragePath?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Project>;
  updateProject: (
    projectId: number,
    projectName: string,
    description?: string,
    status?: string,
    coverImageUrl?: string,
    coverImageStoragePath?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Project>;
  deleteProject: (projectId: number) => Promise<void>;
  
  // Sharing actions
  setSharingEnabled: (projectId: number, enabled: boolean) => Promise<void>;
  getSharingEnabled: (projectId: number) => boolean;
  
  // Utility actions
  addProject: (project: Project) => void;
  removeProject: (projectId: number) => void;
  updateProjectInList: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  totalProjects: 0,
  isLoading: true,

  // Modal states
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showShareModal: false,
  editingProject: null,
  deletingProject: null,
  sharingProject: null,

  // Basic setters
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setTotalProjects: (total) => set({ totalProjects: total }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Modal actions
  openCreateModal: () => set({ showCreateModal: true }),
  closeCreateModal: () => set({ showCreateModal: false }),
  openEditModal: (project) => set({ showEditModal: true, editingProject: project }),
  closeEditModal: () => set({ showEditModal: false, editingProject: null }),
  openDeleteModal: (project) => set({ showDeleteModal: true, deletingProject: project }),
  closeDeleteModal: () => set({ showDeleteModal: false, deletingProject: null }),
  openShareModal: (project) => set({ showShareModal: true, sharingProject: project }),
  closeShareModal: () => set({ showShareModal: false, sharingProject: null }),

  // Load projects from API
  loadProjects: async () => {
    const { setIsLoading, setProjects, setTotalProjects, selectedProject } = get();
    
    try {
      setIsLoading(true);
      const data = await projectsApi.getProjects();
      setTotalProjects(data.length);
      setProjects(data);
      
      // If no project is selected and we have projects, select the first one
      if (data.length > 0 && !selectedProject) {
        set({ selectedProject: data[0] });
      }
    } catch (error: any) {
      console.error(`Error loading projects: ${error.message}`);
      throw error;
    } finally {
      // Add a short delay to ensure skeleton screen shows properly
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  },

  // Create a new project
  createProject: async (
    projectName: string,
    description?: string,
    status: string = 'planning',
    coverImageUrl?: string,
    coverImageStoragePath?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const { addProject, setTotalProjects, totalProjects } = get();
    
    // First create the project
    const newProject: Project = await projectsApi.createProject({
      project_name: projectName,
      description,
      is_deleted: false,
      status,
      start_date: startDate,
      end_date: endDate
    });
    
    // Then, if we have a cover image, update it
    if (coverImageUrl !== undefined && newProject.id) {
      const updatedProject = await projectsApi.updateProjectCoverImage(
        newProject.id,
        coverImageUrl,
        coverImageStoragePath || ''
      );
      newProject.cover_image_url = updatedProject.cover_image_url;
      newProject.cover_image_storage_path = updatedProject.cover_image_storage_path;
    }
    
    addProject(newProject);
    set({ selectedProject: newProject });
    
    return newProject;
  },

  // Update an existing project
  updateProject: async (
    projectId: number,
    projectName: string,
    description?: string,
    status?: string,
    coverImageUrl?: string,
    coverImageStoragePath?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const { updateProjectInList, selectedProject } = get();
    
    // First update the basic project info
    const updatedProject = await projectsApi.updateProject(projectId, {
      project_name: projectName,
      description,
      status,
      start_date: startDate,
      end_date: endDate
    });
    
    // If cover image info is provided, update it separately
    if (coverImageUrl !== undefined && updatedProject.id) {
      const projectWithImage = await projectsApi.updateProjectCoverImage(
        projectId,
        coverImageUrl,
        coverImageStoragePath || ''
      );
      updatedProject.cover_image_url = projectWithImage.cover_image_url;
      updatedProject.cover_image_storage_path = projectWithImage.cover_image_storage_path;
    }
    
    updateProjectInList(updatedProject);
    
    // Update selected project if it's the one being updated
    if (selectedProject?.id === projectId) {
      set({ selectedProject: updatedProject });
    }
    
    return updatedProject;
  },

  // Delete a project
  deleteProject: async (projectId: number) => {
    const { removeProject, projects, selectedProject } = get();
    
    await projectsApi.deleteProject(projectId);
    removeProject(projectId);
    
    // If deleted project was selected, select the first remaining project
    if (selectedProject?.id === projectId) {
      const remainingProjects = projects.filter(project => project.id !== projectId);
      set({ selectedProject: remainingProjects.length > 0 ? remainingProjects[0] : null });
    }
  },

  // Sharing actions
  setSharingEnabled: async (projectId: number, enabled: boolean) => {
    const { updateProjectInList, selectedProject } = get();
    
    try {
      // Update the project's sharing status via API
      const updatedProject = await projectsApi.updateProject(projectId, {
        is_shared: enabled
      });
      
      updateProjectInList(updatedProject);
      
      // Update selected project if it's the one being updated
      if (selectedProject?.id === projectId) {
        set({ selectedProject: updatedProject });
      }
    } catch (error: any) {
      console.error(`Error updating project sharing status: ${error.message}`);
      throw error;
    }
  },
  
  getSharingEnabled: (projectId: number) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    return project?.is_shared ?? false;
  },

  // Utility actions
  addProject: (project) => set((state) => ({ 
    projects: [project, ...state.projects],
    totalProjects: state.totalProjects + 1
  })),
  
  removeProject: (projectId) => set((state) => ({ 
    projects: state.projects.filter(project => project.id !== projectId),
    totalProjects: state.totalProjects - 1
  })),
  
  updateProjectInList: (project) => set((state) => ({ 
    projects: state.projects.map(p => p.id === project.id ? project : p) 
  })),
}));
