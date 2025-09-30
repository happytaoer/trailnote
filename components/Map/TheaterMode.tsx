'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { message } from 'antd';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { Image as ImageType } from '@/types';
import { imagesApi } from '@/lib/api';

interface TheaterModeProps {
  images: ImageType[];
  initialImageIndex: number;
  onClose: () => void;
  onUpdateImage?: (updatedImage: ImageType) => void;
  canEditDescription?: boolean; // Permission to edit image descriptions
}

/**
 * TheaterMode component displays images in a fullscreen carousel with navigation
 * and description editing functionality.
 */
const TheaterMode: React.FC<TheaterModeProps> = ({
  images,
  initialImageIndex = 0,
  onClose,
  onUpdateImage,
  canEditDescription = true, // Default to true to maintain backward compatibility
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(initialImageIndex);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [isSavingDescription, setIsSavingDescription] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const goToNextImage = (): void => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const goToPrevImage = (): void => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number): void => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    if (images.length > 0) {
      setCurrentDescription(images[currentImageIndex].description || '');
    }
  }, [currentImageIndex, images]);

  useEffect(() => {
    if (isEditingDescription && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditingDescription]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isEditingDescription) return; // Don't navigate while editing
      if (e.key === 'ArrowLeft') {
        goToPrevImage();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditingDescription, onClose]);

  const startEditingDescription = (): void => {
    setIsEditingDescription(true);
  };

  const saveDescription = async (): Promise<void> => {
    if (images.length === 0) return;
    
    setIsSavingDescription(true);
    try {
      // Get the current image
      const currentImage = images[currentImageIndex];
      
      // Update the image description in the database
      const updatedImage = await imagesApi.updateImage(currentImage.id, {
        description: currentDescription
      });
      
      // Update the local state if the parent component provided a callback
      if (onUpdateImage) {
        onUpdateImage(updatedImage);
      }
      
      setIsEditingDescription(false);
    } catch (error: any) {
      messageApi.error('Failed to save description');
    } finally {
      setIsSavingDescription(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  // Create content to be rendered in the portal
  const theaterContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center" 
    >
      {/* Close button - positioned at the top right of the entire page */}
      <button 
        className="absolute right-6 top-6 bg-white bg-opacity-70 rounded-full p-2 z-10 shadow-md hover:bg-opacity-100 transition-all"
        onClick={onClose}
        aria-label="Close Theater Mode"
      >
        <FaTimes className="text-gray-800" />
      </button>
        
      <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Main image display area */}
        <div className="relative w-full flex items-center justify-center p-4">
          
          {/* Image container that adapts to image size */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex items-center justify-center">
            <Image
              src={images[currentImageIndex].url}
              alt="Image"
              width={800}
              height={600}
              sizes="100vw"
              className="object-contain max-h-[65vh] max-w-[90vw] w-auto h-auto"
              priority
              unoptimized={!images[currentImageIndex].storage_path}
            />
          </div>
          
          {/* Image count indicator */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
        
        {/* Theater mode description */}
        <div className="mt-2 mx-auto bg-black bg-opacity-50 rounded-md p-4 text-white" style={{ maxWidth: '90%', width: '100%' }}>
          {isEditingDescription ? (
            <div className="flex flex-col">
              <textarea
                ref={textareaRef}
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                className="w-full p-3 bg-black bg-opacity-70 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Add a description for this image..."
                maxLength={150}
              />
              <div className="flex justify-between items-center mt-1 mb-1 text-xs text-gray-300 w-full">
                <span>{currentDescription.length}/150</span>
              </div>
              <div className="flex justify-end mt-2 gap-2">
                <button
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                  onClick={() => setIsEditingDescription(false)}
                  disabled={isSavingDescription}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm transition-colors flex items-center"
                  onClick={saveDescription}
                  disabled={isSavingDescription}
                >
                  {isSavingDescription ? (
                    <FaSpinner className="animate-spin mr-1" />
                  ) : (
                    <FaSave className="mr-1" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div 
              className={`relative ${canEditDescription ? 'cursor-pointer' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                if (canEditDescription) {
                  startEditingDescription();
                }
              }}
            >
              <p className="text-white whitespace-pre-wrap break-words overflow-wrap-anywhere w-full">
                {currentDescription ? currentDescription : canEditDescription ? 'Leave a note about this image' : 'No description available'}
              </p>
            </div>
          )}
        </div>
        
        {/* Bottom thumbnail navigation */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 gap-2 overflow-x-auto py-2" style={{ width: '50%' }}>
            {images.map((image, index) => (
              <button 
                key={index} 
                onClick={() => goToImage(index)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? 'border-blue-500 scale-110' : 'border-transparent opacity-70'
                }`}
              >
                <Image src={image.url} alt="" width={128} height={128} className="w-full h-full object-cover" unoptimized={!image.storage_path} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Use createPortal only in browser environment
  return (
    <>
      {contextHolder}
      {typeof document !== 'undefined' ? createPortal(theaterContent, document.body) : null}
    </>
  );
};

export default TheaterMode;
