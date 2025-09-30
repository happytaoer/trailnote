import { supabase } from '../supabase';
import { Route } from '../../types';

/**
 * API methods for managing routes
 */
export const routesApi = {
  /**
   * Get all routes for a project
   * @param {number} projectId - Project ID
   * @returns {Promise<Route[]>} Array of routes
   */
  getRoutes: async (projectId: number): Promise<Route[]> => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data as Route[];
  },

  /**
   * Get a single route by ID
   * @param {number} id - Route ID
   * @returns {Promise<Route>} Route details
   */
  getRoute: async (id: number): Promise<Route> => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Route;
  },

  /**
   * Create a new route
   * @param {Partial<Route>} route - Route data
   * @returns {Promise<Route>} Created route
   */
  createRoute: async (route: Partial<Route>): Promise<Route> => {
    const { data, error } = await supabase
      .from('routes')
      .insert([route])
      .select();
    
    if (error) throw error;
    return data[0] as Route;
  },

  /**
   * Update a route
   * @param {number} id - Route ID
   * @param {Partial<Route>} route - Route data to update
   * @returns {Promise<Route>} Updated route
   */
  updateRoute: async (id: number, route: Partial<Route>): Promise<Route> => {
    const { data, error } = await supabase
      .from('routes')
      .update(route)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Route;
  },

  /**
   * Delete a route
   * @param {number} id - Route ID
   * @returns {Promise<boolean>} Success status
   */
  deleteRoute: async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
