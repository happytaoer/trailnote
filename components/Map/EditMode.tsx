'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { message, Dropdown, Button, Modal, Switch } from 'antd';
import Image from 'next/image';
import { FaSave, FaSpinner, FaImage, FaCaretDown, FaTrash, FaTrashAlt } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import { storageApi, imagesApi } from '@/lib/api';
import { Image as ImageType, FeatureInfo } from '@/types';
import ImageUrl from './ImageUrl';

interface EditModeProps {
  featureInfo: FeatureInfo;
  projectId: number;
  onChange: (updatedInfo: FeatureInfo) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  images: ImageType[];
  setImages: React.Dispatch<React.SetStateAction<ImageType[]>>;
  isUploadingImage: boolean;
  setIsUploadingImage: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditMode: React.FC<EditModeProps> = ({
  featureInfo,
  projectId,
  onChange,
  onSave,
  onCancel,
  isSaving,
  images,
  setImages,
  isUploadingImage,
  setIsUploadingImage
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isImageUrlModalVisible, setIsImageUrlModalVisible] = useState<boolean>(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [hoverTrashId, setHoverTrashId] = useState<number | null>(null);
  const [latitudeError, setLatitudeError] = useState<string | null>(null);
  const [longitudeError, setLongitudeError] = useState<string | null>(null);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  const handleChange = (key: keyof FeatureInfo, value: FeatureInfo[keyof FeatureInfo]) => {
    // Validate latitude and longitude when they change
    if (key === 'latitude') {
      const numValue = parseFloat(value as string);
      if (isNaN(numValue) || numValue < -90 || numValue > 90) {
        setLatitudeError('Latitude must be between -90 and 90');
      } else {
        setLatitudeError(null);
      }
    }
    
    if (key === 'longitude') {
      const numValue = parseFloat(value as string);
      if (isNaN(numValue) || numValue < -180 || numValue > 180) {
        setLongitudeError('Longitude must be between -180 and 180');
      } else {
        setLongitudeError(null);
      }
    }
    
    onChange({ ...featureInfo, [key]: value });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteImage = async (imageId: number): Promise<void> => {
    try {
      setDeletingImageId(imageId);
      await imagesApi.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      messageApi.success('Image deleted successfully');
    } catch (error: any) {
      messageApi.error('Failed to delete image, please try again');
    } finally {
      setDeletingImageId(null);
    }
  };
  
  const handleImageUpload = async (file: File) => {
    if (!featureInfo.id) return;
    
    if (!file.type.match('image.*')) {
      messageApi.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      messageApi.error('Image size should be less than 5MB');
      return;
    }
    
    setIsUploadingImage(true);
    try {
      const newImage = await storageApi.uploadEntityImage(
        file,
        featureInfo.type,
        featureInfo.id,
        projectId,
        '',
        images.length
      );
      
      setImages(prev => [...prev, newImage]);
      messageApi.success('Image uploaded successfully');
    } catch (error: any) {
      messageApi.error('Failed to upload image, please try again');
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  useEffect(() => {
    // Function to update window height
    const updateHeight = (): void => {
      setWindowHeight(window.innerHeight);
    };

    // Set initial height
    updateHeight();

    // Add event listener for window resize
    window.addEventListener('resize', updateHeight);

    // Clean up
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleSave = useCallback(async () => {
    if (featureInfo.type === 'route' && !isValidHexColor(featureInfo.color)) {
      messageApi.error('Please enter a valid hex color (e.g., #FF0000)');
      return;
    }
    
    // Validate coordinates before saving
    if (featureInfo.type === 'marker') {
      if (!featureInfo.latitude || !featureInfo.longitude) {
        messageApi.error('Latitude and longitude are required');
        return;
      }
      
      const lat = parseFloat(String(featureInfo.latitude));
      const lng = parseFloat(String(featureInfo.longitude));
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        messageApi.error('Latitude must be between -90 and 90');
        return;
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        messageApi.error('Longitude must be between -180 and 180');
        return;
      }
    }
    
    await onSave();
  }, [featureInfo]);



  // Calculate max height as 70% of window height
  const maxHeight = windowHeight ? `${Math.floor(windowHeight * 0.7)}px` : 'none';

  return (
    <>
      {contextHolder}
      <div className="overflow-y-auto" style={{ maxHeight }}>
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <span className={`text-xs ${featureInfo.name.length > 30 ? 'text-red-500' : 'text-gray-500'}`}>
            {featureInfo.name.length}/30
          </span>
        </div>
        <input
          type="text"
          className={`w-full p-2 border ${featureInfo.name.length > 30 ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          value={featureInfo.name}
          onChange={(e) => handleChange('name', e.target.value.slice(0, 30))}
          placeholder="Enter a title..."
          maxLength={30}
        />
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <span className={`text-xs ${featureInfo.description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
            {featureInfo.description.length}/1000
          </span>
        </div>
        <textarea
          className={`w-full p-2 border ${featureInfo.description.length > 1000 ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          rows={6}
          value={featureInfo.description}
          onChange={(e) => handleChange('description', e.target.value.slice(0, 1000))}
          placeholder="Enter a description..."
          maxLength={1000}
        />
      </div>
      
      {featureInfo.type === 'marker' && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="text"
                className={`w-full p-2 border ${latitudeError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                value={featureInfo.latitude !== undefined ? featureInfo.latitude : ''}
                onChange={(e) => {
                  const value = e.target.value.trim() === '' ? undefined : parseFloat(e.target.value);
                  handleChange('latitude', value);
                }}
                placeholder="-90 to 90"
              />
              {latitudeError && (
                <p className="text-xs text-red-500 mt-1">{latitudeError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="text"
                className={`w-full p-2 border ${longitudeError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                value={featureInfo.longitude !== undefined ? featureInfo.longitude : ''}
                onChange={(e) => {
                  const value = e.target.value.trim() === '' ? undefined : parseFloat(e.target.value);
                  handleChange('longitude', value);
                }}
                placeholder="-180 to 180"
              />
              {longitudeError && (
                <p className="text-xs text-red-500 mt-1">{longitudeError}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div className="flex items-center gap-3">
          <Switch 
            checked={featureInfo.status === 'visited'}
            onChange={(checked: boolean) => handleChange('status', checked ? 'visited' : 'not_visited')}
            checkedChildren="Visited"
            unCheckedChildren="Not Visited"
            style={{
              backgroundColor: featureInfo.status === 'visited' ? '#52c41a' : undefined
            }}
          />
        </div>
      </div>
      
      {featureInfo.type === 'route' && (
        <>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer mr-2"
                style={{ backgroundColor: featureInfo.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                value={featureInfo.color}
                onChange={(e) => handleChange('color', e.target.value)}
              />
            </div>
            
            {showColorPicker && (
              <div className="mt-2 relative z-50">
                <div 
                  className="fixed inset-0" 
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="absolute">
                  <HexColorPicker 
                    color={featureInfo.color} 
                    onChange={(color) => handleChange('color', color)} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                className="flex-1 mr-2"
                value={featureInfo.width}
                onChange={(e) => handleChange('width', e.target.value)}
              />
              <span className="w-8 text-center">{featureInfo.width}px</span>
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="flex-1 mr-2"
                value={featureInfo.opacity ?? 1.0}
                onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              />
              <span className="w-12 text-center">{Math.round((featureInfo.opacity ?? 1.0) * 100)}%</span>
            </div>
          </div>
        </>
      )}
      
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Media</label>
          {featureInfo.id && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'upload',
                    label: 'Upload from device',
                    onClick: () => {
                      triggerFileInput();
                      setIsImageUrlModalVisible(false);
                    },
                  },
                  {
                    key: 'url',
                    label: 'Add from URL',
                    onClick: () => {
                      setIsImageUrlModalVisible(true);
                    },
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button 
                type="text" 
                className="flex items-center text-blue-500 hover:text-blue-700"
                icon={<FaImage className="mr-1" />}
              >
                Add Media <FaCaretDown className="ml-1" />
              </Button>
            </Dropdown>
          )}
        </div>
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleImageUpload(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
        
        {isUploadingImage && (
          <div className="mt-2 flex items-center justify-center text-sm text-blue-500">
            <FaSpinner className="animate-spin mr-2" />
            Uploading image...
          </div>
        )}
        
        {featureInfo.id && (
          <Modal
            title="Add Image URL"
            open={isImageUrlModalVisible}
            onCancel={() => setIsImageUrlModalVisible(false)}
            footer={null}
            destroyOnHidden
          >
            <ImageUrl
              featureId={featureInfo.id}
              featureType={featureInfo.type}
              projectId={projectId}
              setImages={setImages}
              onClose={() => setIsImageUrlModalVisible(false)}
            />
          </Modal>
        )}
        
        {featureInfo.id && images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {images.map(image => (
              <div key={image.id} className="relative group">
                <div className="w-full h-24 rounded-md overflow-hidden relative" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Image
                    src={image.url}
                    alt=""
                    width={192}
                    height={96}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${deletingImageId === image.id ? 'opacity-40' : 'opacity-100'}`}
                    unoptimized={!image.storage_path}
                  />
                  {deletingImageId === image.id && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <FaSpinner className="animate-spin text-white drop-shadow-lg" size={20} />
                    </div>
                  )}
                </div>
                <button 
                  className={`absolute top-1 right-1 rounded-full p-1 z-10 transition-all duration-200 ${hoverTrashId === image.id ? 'scale-110 rotate-12' : ''}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.id);
                  }}
                  onMouseEnter={() => setHoverTrashId(image.id)}
                  onMouseLeave={() => setHoverTrashId(null)}
                  title="Delete image"
                  disabled={deletingImageId === image.id}
                >
                  {hoverTrashId === image.id ? (
                    <FaTrashAlt size={10} className="text-red-500 animate-bounce" />
                  ) : (
                    <FaTrash size={10} className="text-red-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 rounded-md transition-all cursor-pointer"
          style={{
            background: 'rgba(156, 163, 175, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#374151'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(156, 163, 175, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(156, 163, 175, 0.8)';
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 text-white rounded-md transition-all flex items-center cursor-pointer"
          style={{
            background: 'rgba(59, 130, 246, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(37, 99, 235, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
          }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <FaSpinner className="mr-2 animate-spin" />
          ) : (
            <FaSave className="mr-2" />
          )}
          Save
        </button>
      </div>
      </div>
    </>
  );
};

export default EditMode;
