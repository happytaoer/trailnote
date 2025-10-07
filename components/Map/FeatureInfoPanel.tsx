'use client';

import { useState, useEffect } from 'react';
import { message } from 'antd';
import { imagesApi } from '@/lib/api';
import { Image, FeatureInfo } from '@/types';
import EditMode from './EditMode';
import ViewMode from './ViewMode';
import { Card, Button, Dropdown, Space, Spin, Badge, MenuProps } from 'antd';
import { CloseOutlined, EnvironmentOutlined, NodeIndexOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';

interface FeatureInfoPanelProps {
  featureInfo: FeatureInfo;
  projectId: number;
  onClose: () => void;
  onSave: () => Promise<void>;
  onChange: (updatedInfo: FeatureInfo) => void;
  onDelete?: () => Promise<void>;
  isSaving: boolean;
  isDeleting?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
  onSaveEditChanges?: () => void;
  onCancelEditChanges?: () => void;
  isEditMode?: boolean;
  isSharedMode?: boolean; // Whether panel is in read-only mode (for shared views)
  preloadedImages?: Image[]; // Preloaded images for shared mode to avoid extra API calls
}

const FeatureInfoPanel: React.FC<FeatureInfoPanelProps> = ({
  featureInfo,
  projectId,
  onClose,
  onSave,
  onChange,
  onDelete,
  isSaving,
  isDeleting = false,
  onEditModeChange,
  onSaveEditChanges,
  onCancelEditChanges,
  isEditMode: externalEditMode,
  isSharedMode = false, // Whether panel is in read-only mode (for shared views)
  preloadedImages
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditMode, setIsEditMode] = useState(externalEditMode || false);
  
  // Sync with external edit mode if provided
  useEffect(() => {
    if (externalEditMode !== undefined) {
      setIsEditMode(externalEditMode);
    }
  }, [externalEditMode]);
  const [images, setImages] = useState<Image[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (featureInfo.id) {
      if (isSharedMode) {
        // Use preloaded images if available (from consolidated API)
        setImages(preloadedImages || []);
        setIsLoadingImages(false);
      } else {
        // Otherwise load images normally
        loadImages();
      }
    }
    // Set default status to 'visited' if not already set
    if (!featureInfo.status) {
      onChange({ ...featureInfo, status: 'visited' });
    }
  }, [featureInfo.id, preloadedImages]);

  const loadImages = async () => {
    if (!featureInfo.id) return;
    
    setIsLoadingImages(true);
    try {
      const loadedImages = await imagesApi.getImages(featureInfo.type, featureInfo.id);
      setImages(loadedImages);
    } catch (error: any) {
      messageApi.error(`Failed to load images: ${error.message}`);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleDelete = (): void => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleSave = async (): Promise<void> => {
    // First save map edit position changes
    if (onSaveEditChanges) {
      onSaveEditChanges();
    }
    
    // Then save form data
    await onSave();
    
    // Switch back to view mode without closing the panel
    setIsEditMode(false);
    if (onEditModeChange) {
      onEditModeChange(false);
    }
  };

  const handleCancel = (): void => {
    if (onCancelEditChanges) {
      onCancelEditChanges();
    }
    setIsEditMode(false);
    if (onEditModeChange) {
      onEditModeChange(false);
    }
  };

  // Handle toggle edit mode
  const handleToggleEditMode = () => {
    // Don't allow editing in read-only mode
    if (isSharedMode) return;
    
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    // Notify parent component of edit mode change
    if (onEditModeChange) {
      onEditModeChange(newEditMode);
    }
  };

  // Define dropdown menu items
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: (
        <Space>
          {isDeleting ? <Spin size="small" /> : <DeleteOutlined />}
          <span>Delete</span>
        </Space>
      ),
      danger: true,
      onClick: handleDelete,
      disabled: isDeleting
    }
  ];

  // Card title with icon and feature name
  const cardTitle = (
    <Space>
      <span style={{ color: '#1890ff' }}>
        {featureInfo.type === 'marker' ? <EnvironmentOutlined /> : <NodeIndexOutlined />}
      </span>
      <span>
        {featureInfo.name || (featureInfo.type === 'marker' ? 'Unnamed Marker' : 'Unnamed Route')}
      </span>
      {isEditMode && (
        <Badge 
          count="Editing" 
          style={{ 
            backgroundColor: '#e6f7ff', 
            color: '#1890ff', 
            boxShadow: 'none',
            fontSize: '12px'
          }} 
        />
      )}
    </Space>
  );

  // Card extra content (dropdown and close button)
  const cardExtra = (
    <Space>
      {/* Only show dropdown menu if not in read-only mode */}
      {!isSharedMode && (
        <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )}
      <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
    </Space>
  );

  return (
    <Card 
      title={cardTitle}
      extra={cardExtra}
      style={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        width: 320, 
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)',
        padding: 0,
        overflow: 'hidden'
      }}
      styles={{ 
        body: { 
          padding: "10px",
          background: 'transparent'
        },
        header: {
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }
      }}
    >
      {contextHolder}
        {isEditMode ? (
          <EditMode 
            featureInfo={featureInfo}
            projectId={projectId}
            onChange={onChange}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            images={images}
            setImages={setImages}
            isUploadingImage={isUploadingImage}
            setIsUploadingImage={setIsUploadingImage}
          />
        ) : (
          <ViewMode 
            featureInfo={featureInfo} 
            onEdit={handleToggleEditMode} 
            images={images} 
            isLoadingImages={isLoadingImages}
            isSharedMode={isSharedMode} // Pass read-only flag to ViewMode
          />
        )}
    </Card>
  );
};

export default FeatureInfoPanel;
