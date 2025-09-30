import { supabase } from '../supabase';
import { Marker } from '../../types';

/**
 * API methods for managing markers
 */
export const markersApi = {
  /**
   * Get all markers for a project
   * @param {number} projectId - Project ID
   * @returns {Promise<Marker[]>} Array of markers
   */
  getMarkers: async (projectId: number): Promise<Marker[]> => {
    const { data, error } = await supabase
      .from('markers')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data as Marker[];
  },

  /**
   * Get a single marker by ID
   * @param {number} id - Marker ID
   * @returns {Promise<Marker>} Marker details
   */
  getMarker: async (id: number): Promise<Marker> => {
    const { data, error } = await supabase
      .from('markers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Marker;
  },

  /**
   * Create a new marker
   * @param {Partial<Marker>} marker - Marker data
   * @returns {Promise<Marker>} Created marker
   */
  createMarker: async (marker: Partial<Marker>): Promise<Marker> => {
    const { data, error } = await supabase
      .from('markers')
      .insert([marker])
      .select();
    
    if (error) throw error;
    return data[0] as Marker;
  },

  /**
   * Update a marker
   * @param {number} id - Marker ID
   * @param {Partial<Marker>} marker - Marker data to update
   * @returns {Promise<Marker>} Updated marker
   */
  updateMarker: async (id: number, marker: Partial<Marker>): Promise<Marker> => {
    const { data, error } = await supabase
      .from('markers')
      .update(marker)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as Marker;
  },

  /**
   * Delete a marker
   * @param {number} id - Marker ID
   * @returns {Promise<boolean>} Success status
   */
  deleteMarker: async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from('markers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
