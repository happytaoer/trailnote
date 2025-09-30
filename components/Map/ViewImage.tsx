import React from 'react';
import Image from 'next/image';
import { Spin, Tooltip } from 'antd';
import { FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Data for a single image.
 */
export interface ImageData {
  /** URL of the image. */
  readonly url: string;
  /** Storage path of the image. Empty for external URLs. */
  readonly storage_path?: string;
  /** Description of the image. */
  readonly description?: string;
}

/**
 * Props for the ViewImage component.
 */
export interface ViewImageProps {
  /** Whether images are loading. */
  readonly isLoadingImages: boolean;
  /** Array of image data. */
  readonly images: readonly ImageData[];
  /** Index of the currently displayed image. */
  readonly currentImageIndex: number;
  /** Toggle theater mode on click. */
  readonly toggleTheaterMode: () => void;
  /** Navigate to previous image. */
  readonly goToPrevImage: () => void;
  /** Navigate to next image. */
  readonly goToNextImage: () => void;
  /** Navigate to a specific image by index. */
  readonly goToImage: (index: number) => void;
}

/**
 * Extracted image carousel component with loading state and navigation.
 * @param props - Component props.
 */
export const ViewImage: React.FC<ViewImageProps> = ({
  isLoadingImages,
  images,
  currentImageIndex,
  toggleTheaterMode,
  goToPrevImage,
  goToNextImage,
  goToImage,
}) => {
  if (isLoadingImages) {
    return (
      <div className="flex justify-center py-4 mb-4">
        <Spin indicator={<FaSpinner className="animate-spin text-blue-500" />} />
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-500 capitalize tracking-wider mb-2">
        Images
      </h4>
      <div
        className="relative rounded-lg overflow-hidden cursor-pointer"
        onClick={toggleTheaterMode}
      >
        <div className="w-full h-48 bg-gray-100 relative">
          <Tooltip 
            title={images[currentImageIndex].description} 
            placement="top"
            mouseEnterDelay={0.5}
          >
            <Image
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].description || ""}
              width={768}
              height={192}
              className="w-full h-full object-cover"
              priority={currentImageIndex === 0}
              unoptimized={!images[currentImageIndex].storage_path} // Use unoptimized for external URLs
            />
          </Tooltip>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
              >
                <FaChevronLeft className="text-gray-700" />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
              >
                <FaChevronRight className="text-gray-700" />
              </button>
            </>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  );
};
