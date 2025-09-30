'use client';

import { useState } from 'react';
import { message, Input, Button } from 'antd';
import { FaSave, FaSpinner } from 'react-icons/fa';
import { imagesApi } from '@/lib/api';
import { Image as ImageType } from '@/types';

interface ImageUrlProps {
  featureId: number;
  featureType: 'marker' | 'route';
  projectId: number;
  setImages: React.Dispatch<React.SetStateAction<ImageType[]>>;
  onClose: () => void;
}

const ImageUrl: React.FC<ImageUrlProps> = ({
  featureId,
  featureType,
  projectId,
  setImages,
  onClose
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async (): Promise<void> => {
    if (!imageUrl.trim()) {
      messageApi.error('Please enter a valid image URL');
      return;
    }

    // Simple URL validation
    try {
      new URL(imageUrl);
    } catch (e) {
      messageApi.error('Please enter a valid URL');
      return;
    }

    setIsSaving(true);
    try {
      // Create a new image record with URL directly
      const newImage: Omit<ImageType, 'id' | 'created_at' | 'is_deleted' | 'user_id'> = {
        entity_type: featureType,
        entity_id: featureId,
        storage_path: '', // Empty storage path indicates direct URL
        description: '',
        order: 0,
        url: imageUrl
      };

      // Add image to database with URL      
      const savedImage = await imagesApi.addImage(newImage);

      // Add to images array
      setImages(prev => [...prev, savedImage]);
      
      // Reset and close
      setImageUrl('');
      onClose();
      messageApi.success('Image URL added successfully');
    } catch (error: any) {
      messageApi.error('Failed to save image URL, please try again');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter a direct URL to an image file (JPG, PNG, GIF, etc.)
          </p>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSave}
            disabled={isSaving}
            icon={isSaving ? <FaSpinner className="animate-spin mr-1" /> : <FaSave className="mr-1" />}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ImageUrl;
