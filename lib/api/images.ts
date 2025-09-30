import { supabase } from '../supabase';
import { Image } from '../../types';

/**
 * API methods for managing feature images
 */
export const imagesApi = {
  /**
   * Get all images for an entity
   * @param {('marker' | 'route')} entityType - Type of entity
   * @param {number} entityId - ID of the entity
   * @returns {Promise<Image[]>} Array of images with URLs
   */
  getImages: async (entityType: 'marker' | 'route', entityId: number): Promise<Image[]> => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('order', { ascending: true });
    
    if (error) throw error;
    
    const imagesWithUrls = data?.map(image => {
      if (image.storage_path) {
        // For images stored in Supabase Storage, generate public URL
        const { data: urlData } = supabase.storage
          .from('trailnote')
          .getPublicUrl(image.storage_path);
        return {
          ...image,
          url: urlData.publicUrl
        } as Image;
      } else {
        // For direct URL images, use the URL as is
        return image as Image;
      }
    }) || [];
    
    return imagesWithUrls;
  },
  
  /**
   * Delete an image (both database record and storage file if applicable)
   * @param {number} imageId - Image ID
   * @returns {Promise<boolean>} Success status
   */
  deleteImage: async (imageId: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('storage_path')
        .eq('id', imageId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error(`Not found image record with ID ${imageId}`);
      
      const storagePath = data.storage_path;
      
      // Only delete from storage if the image has a storage path
      if (storagePath) {
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from('trailnote')
          .remove([storagePath]);
        
        if (storageError) throw storageError;
      }
      
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);
      
      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add a new image
   * @param {Omit<Image, 'id' | 'created_at' | 'is_deleted' | 'url' | 'user_id'>} image - Image data
   * @returns {Promise<Image>} Created image with URL
   */
  addImage: async (image: Omit<Image, 'id' | 'created_at' | 'is_deleted' | 'url' | 'user_id'>): Promise<Image> => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    const { data, error } = await supabase
      .from('images')
      .insert([{   
        ...image,
        is_deleted: false,
        user_id: userId
      }])
      .select();
    
    if (error) throw error;

    if (image.storage_path) {
      // For images stored in Supabase Storage, generate public URL
      const { data: urlData } = supabase.storage
        .from('trailnote')
        .getPublicUrl(image.storage_path);
      return { ...data[0], url: urlData.publicUrl } as Image;
    } else {
      // For direct URL images, use the URL as is
      return data[0] as Image;
    }
  },

  /**
   * Update image details
   * @param {number} id - Image ID
   * @param {Partial<Omit<Image, 'id' | 'created_at' | 'entity_type' | 'entity_id' | 'storage_path'>>} updates - Image data to update
   * @returns {Promise<Image>} Updated image with URL
   */
  updateImage: async (
    id: number, 
    updates: Partial<Omit<Image, 'id' | 'created_at' | 'entity_type' | 'entity_id' | 'storage_path'>>
  ): Promise<Image> => {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data[0].storage_path) {
      // For images stored in Supabase Storage, generate public URL
      const { data: urlData } = supabase.storage
        .from('trailnote')
        .getPublicUrl(data[0].storage_path);
      return { ...data[0], url: urlData.publicUrl } as Image;
    } else {
      // For direct URL images, use the URL as is
      return data[0] as Image;
    }
  },
};
