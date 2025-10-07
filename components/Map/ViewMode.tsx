'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Image as ImageType, FeatureInfo } from '@/types';
import { Typography, Descriptions, Space, Button, Tag, Tooltip } from 'antd';
import TheaterMode from './TheaterMode';
import { ViewImage } from './ViewImage';

interface ViewModeProps {
  featureInfo: FeatureInfo;
  onEdit: () => void;
  images: ImageType[];
  isLoadingImages: boolean;
  onUpdateImage?: (updatedImage: ImageType) => void;
  isSharedMode?: boolean; // Whether the component is in read-only mode (for shared views)
}

const ViewMode: React.FC<ViewModeProps> = ({
  featureInfo,
  onEdit,
  images,
  isLoadingImages,
  onUpdateImage,
  isSharedMode = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTheaterMode, setShowTheaterMode] = useState(false);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  const goToNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const goToPrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleTheaterMode = () => {
    setShowTheaterMode(!showTheaterMode);
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

  // Calculate max height as 70% of window height
  const maxHeight = windowHeight ? `${Math.floor(windowHeight * 0.7)}px` : 'none';

  return (
    <>
      <div className="overflow-y-auto" style={{ maxHeight }}>
      
      <ViewImage
        isLoadingImages={isLoadingImages}
        images={images}
        currentImageIndex={currentImageIndex}
        toggleTheaterMode={toggleTheaterMode}
        goToPrevImage={goToPrevImage}
        goToNextImage={goToNextImage}
        goToImage={goToImage}
      />
      
      <Descriptions layout="vertical" column={1} className="mb-4" size="small">
        {featureInfo.description && (
          <Descriptions.Item label={<Typography.Text type="secondary" style={{ textTransform: 'capitalize', fontWeight: 600 }}>Description</Typography.Text>}>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {featureInfo.description}
            </Typography.Paragraph>
          </Descriptions.Item>
        )}
        
        {featureInfo.type === 'marker' && featureInfo.latitude !== undefined && featureInfo.longitude !== undefined && (
          <Descriptions.Item label={<Typography.Text type="secondary" style={{ textTransform: 'capitalize', fontWeight: 600 }}>Location</Typography.Text>}>
            <Space>
              <Typography.Text type="secondary" style={{ fontSize: '0.75rem' }}>Lat/Lng:</Typography.Text>
              <Typography.Text style={{ fontFamily: 'monospace' }}>
                {featureInfo.latitude.toFixed(5)}, {featureInfo.longitude.toFixed(5)}
              </Typography.Text>
            </Space>
          </Descriptions.Item>
        )}
        
        {featureInfo.type === 'route' && (
          <Descriptions.Item label={<Typography.Text type="secondary" style={{ textTransform: 'capitalize', fontWeight: 600 }}>Distance</Typography.Text>}>
            <Typography.Text>
              {featureInfo.route_distance ? (
                featureInfo.route_distance >= 1000 ? 
                  `${(featureInfo.route_distance / 1000).toFixed(2)} km` : 
                  `${featureInfo.route_distance.toFixed(0)} m`
              ) : 'Unknown'}
            </Typography.Text>
          </Descriptions.Item>
        )}
        
        {/* Only show Status in non-shared mode */}
        {!isSharedMode && (
          <Descriptions.Item label={<Typography.Text type="secondary" style={{ textTransform: 'capitalize', fontWeight: 600 }}>Status</Typography.Text>}>
            <Tooltip title={featureInfo.status === 'not_visited' ? 'Not Visited' : 'Visited'}>
              {featureInfo.status === 'not_visited' ? (
                <FaTimesCircle size={12} color="orange" />
              ) : (
                <FaCheckCircle size={12} color="green" />
              )}
            </Tooltip>
          </Descriptions.Item>
        )}
      </Descriptions>
    
      <div className="flex justify-end gap-2">
        <Space>
          {/* Only show Edit button when not in read-only mode */}
          {!isSharedMode && (
            <Button 
              type="primary" 
              onClick={onEdit} 
              icon={<FaEdit />}
              style={{
                background: 'rgba(59, 130, 246, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
              }}
            >
              Edit
            </Button>
          )}
        </Space>
      </div>

      </div>
      
      {/* Theater mode component */}
      {showTheaterMode && images.length > 0 && (
        <TheaterMode
          images={images}
          initialImageIndex={currentImageIndex}
          onClose={toggleTheaterMode}
          onUpdateImage={onUpdateImage}
          canEditDescription={!isSharedMode}
        />
      )}
    </>
  );
};

export default ViewMode;
