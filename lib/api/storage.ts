import { supabase } from '../supabase';
import { Image } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * API methods for storage operations
 */
export const storageApi = {
  /**
   * Upload an image and create database record
   * @param {File} file - File to upload
   * @param {('marker' | 'route')} entityType - Type of entity
   * @param {number} entityId - ID of the entity
   * @param {number} projectId - Project ID
   * @param {string} description - Image description
   * @param {number} order - Display order
   * @returns {Promise<Image>} Uploaded image with URL
   */
  uploadEntityImage: async (
    file: File, 
    entityType: 'marker' | 'route', 
    entityId: number, 
    projectId: number, 
    description: string = '', 
    order: number = 0
  ): Promise<Image> => {
    try {
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      // 1. Generate a UUID for the filename
      const uuid = uuidv4();
      const fileExtension = file.name.split('.').pop() || '';
      
      // 2. Build the storage path
      const fileName = `features/${projectId}/${entityType}s/${entityId}/${uuid}${fileExtension ? '.' + fileExtension : ''}`;
      
      // 3. Upload the file
      const { error: uploadError } = await supabase.storage
        .from('trailnote')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        // If it's a path issue, throw an invalid path error
        if (uploadError.message && (uploadError.message.includes('invalid key') || uploadError.message.includes('not found'))) {
          throw new Error(`Upload failed: storage path ${fileName} is invalid. Please ensure project ID, entity type, and ID are valid.`);
        }
        
        throw uploadError;
      }
      
      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from('trailnote')
        .getPublicUrl(fileName);
      
      // 5. Create database record
      const imageData = {
        entity_type: entityType,
        entity_id: entityId,
        storage_path: fileName,
        description,
        order,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('images')
        .insert([imageData])
        .select();
      
      if (error) {
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage.from('trailnote').remove([fileName]);
        throw error;
      }
      
      // Create full Image object including the public URL
      const image: Image = {
        ...data[0],
        url: urlData.publicUrl
      };
      
      return image;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload a user avatar image
   * @param {File} file - Avatar file to upload
   * @returns {Promise<string>} Storage path of the uploaded avatar
   */
  uploadUserAvatar: async (file: File): Promise<string> => {
    try {
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Generate a UUID for the filename
      const uuid = uuidv4();
      const fileExtension = file.name.split('.').pop() || '';
      
      // Build the storage path
      const fileName = `avatars/${userId}/${uuid}${fileExtension ? '.' + fileExtension : ''}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('trailnote')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      return fileName;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a file from storage
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  /**
   * Upload a project cover image
   * @param {File} file - Image file to upload
   * @param {number} projectId - Project ID
   * @returns {Promise<string>} Public URL of the uploaded image and storage path
   */
  uploadProjectImage: async (file: File, projectId: number): Promise<{publicUrl: string, storagePath: string}> => {
    try {

      // Generate a UUID for the filename
      const uuid = uuidv4();
      const fileExtension = file.name.split('.').pop() || '';
      
      // Build the storage path
      const fileName = `projects/${projectId}/${uuid}${fileExtension ? '.' + fileExtension : ''}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('trailnote')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('trailnote')
        .getPublicUrl(fileName);
      
      return {
        publicUrl: urlData.publicUrl,
        storagePath: fileName
      };
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (path: string): Promise<boolean> => {
    const { error } = await supabase.storage
      .from('trailnote')
      .remove([path]);
    
    if (error) throw error;
    return true;
  }
};
