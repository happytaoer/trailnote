import { supabase } from '../supabase';
import { storageApi } from './storage';
import { Project } from '../../types';

/**
 * API methods for managing projects
 */
export const projectsApi = {
  /**
   * Get all projects for a user
   * @returns {Promise<Project[]>} Array of projects
   */
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Project[];
  },

  /**
   * Get a single project by ID
   * @param {number} id - Project ID
   * @returns {Promise<Project>} Project details
   */
  getProject: async (id: number): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Project;
  },

  /**
   * Create a new project
   * @param {Partial<Project>} project - Project data
   * @returns {Promise<Project>} Created project
   */
  createProject: async (project: Partial<Project>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select();
    
    if (error) throw error;
    return data[0] as Project;
  },

  /**
   * Update project cover image
   * @param {number} id - Project ID
   * @param {string} coverImageUrl - Public URL of the cover image
   * @param {string} coverImageStoragePath - Storage path of the cover image
   * @returns {Promise<Project>} Updated project
   */
  updateProjectCoverImage: async (id: number, coverImageUrl: string, coverImageStoragePath: string): Promise<Project> => {
    // Get the current project to check if it already has a cover image to clean up
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('cover_image_storage_path')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // If there's an existing cover image and it's different from the new one, delete it
    if (existingProject?.cover_image_storage_path && 
        existingProject.cover_image_storage_path !== coverImageStoragePath) {
      try {
        await storageApi.deleteFile(existingProject.cover_image_storage_path);
      } catch (deleteError) {
        console.error('Failed to delete old cover image:', deleteError);
        // Continue with the update even if deletion fails
      }
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update({ 
        cover_image_url: coverImageUrl,
        cover_image_storage_path: coverImageStoragePath
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Project;
  },

  /**
   * Update a project
   * @param {number} id - Project ID
   * @param {Partial<Project>} project - Project data to update
   * @returns {Promise<Project>} Updated project
   */
  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Project;
  },

  /**
   * Update only the summary field of a project
   * @param {number} id - Project ID
   * @param {string} summary - AI summary text
   * @returns {Promise<Project>} Updated project
   */
  updateProjectSummary: async (id: number, summary: string): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update({ ai_summary: summary })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0] as Project;
  },

  /**
   * Search projects with optional filters
   * @param {string} query - Search query
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @param {[Date | null, Date | null]} dateRange - Optional date range filter
   * @returns {Promise<{data: Project[], totalCount: number}>} Search results with pagination info
   */
  searchProjects: async (
    query: string, 
    page: number = 0, 
    limit: number = 5, 
    dateRange?: [Date | null, Date | null]
  ): Promise<{data: Project[], totalCount: number}> => {
    // Create base query
    let projectsQuery = supabase
      .from('projects')
      .select('*');
      
    // Add project name search condition
    if (query) {
      projectsQuery = projectsQuery.ilike('project_name', `%${query}%`);
    }
    
    // Add date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      
      if (startDate) {
        // Format as ISO string and set to start of day
        const formattedStartDate = new Date(startDate);
        formattedStartDate.setHours(0, 0, 0, 0);
        projectsQuery = projectsQuery.gte('created_at', formattedStartDate.toISOString());
      }
      
      if (endDate) {
        // Format as ISO string and set to end of day
        const formattedEndDate = new Date(endDate);
        formattedEndDate.setHours(23, 59, 59, 999);
        projectsQuery = projectsQuery.lte('created_at', formattedEndDate.toISOString());
      }
    }
    
    // Add sorting
    projectsQuery = projectsQuery.order('created_at', { ascending: false });
    
    // Execute query
    const { data, error } = await projectsQuery;
    
    if (error) throw error;
    
    // Get total count
    const totalCount = data.length;
    
    // Manual pagination
    const paginatedData = data.slice(page * limit, (page * limit) + limit);
    
    return {
      data: paginatedData as Project[],
      totalCount
    };
  },

  /**
   * Delete a project
   * @param {number} id - Project ID
   * @returns {Promise<boolean>} Success status
   */
  deleteProject: async (id: number): Promise<boolean> => {
    // First get the project to check if it has a cover image to clean up
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('cover_image_storage_path')
      .eq('id', id)
      .single();
    
    // If we can't get the project, it might already be deleted or doesn't exist
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    // If there's an existing cover image, delete it
    if (existingProject?.cover_image_storage_path) {
      try {
        await storageApi.deleteFile(existingProject.cover_image_storage_path);
      } catch (deleteError) {
        console.error('Failed to delete project cover image:', deleteError);
        // Continue with the project deletion even if image deletion fails
      }
      
      // Also delete the image record from the images table if it exists
      try {
        await supabase
          .from('images')
          .delete()
          .eq('entity_type', 'project')
          .eq('entity_id', id);
      } catch (imageDeleteError) {
        console.error('Failed to delete project image record:', imageDeleteError);
        // Continue with the project deletion even if image record deletion fails
      }
    }
    
    // Now delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  shareProject: async (
    projectId: number,
    isShared: boolean
  ): Promise<Project> => {    
    let shareData: Partial<Project> = {};
    
    if (isShared) {
      shareData = {
        is_shared: true,
      };
    } else {
      shareData = {
        is_shared: false
      };
    }
    
    // Update the project with sharing information
    const { data, error } = await supabase
      .from('projects')
      .update(shareData)
      .eq('id', projectId)
      .select('*')
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Project;
  },
};
