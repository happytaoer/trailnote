import { supabase } from '../supabase';
import { UserSettings } from '../../types';

/**
 * API methods for managing user settings
 */
export const userSettingsApi = {
  /**
   * Get user settings
   * @returns {Promise<UserSettings | null>} User settings or null if not found
   */
  getUserSettings: async (): Promise<UserSettings | null> => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .single();
    
    if (error) {
      // If no settings found, return null instead of throwing error
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as UserSettings;
  },

  /**
   * Update user settings
   * @param {Partial<UserSettings>} settings - Settings data to update
   * @returns {Promise<UserSettings>} Updated settings
   */
  updateUserSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    // Check if user already has settings
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id');

    let result;
    
    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings[0].id)
        .select();
      
      if (error) throw error;
      result = data[0];
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          ...settings
        }])
        .select();
      
      if (error) throw error;
      result = data[0];
    }
    
    return result as UserSettings;
  }
};
