'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Dropdown, Spin, MenuProps, Tooltip, message } from 'antd';
import { Marker, Route } from '@/types';
import { MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMapStore } from '@/stores';
import { markersApi, routesApi } from '@/lib/api';

interface FeatureItemProps {
  feature: Marker | Route;
  type: 'marker' | 'route';
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
  isSharedMode?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = React.memo(({
  feature,
  type,
  isSelected,
  onClick,
  onEdit,
  isSharedMode = false,
}) => {

  const isMountedRef = useRef(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  
  // Get stores based on shared mode
  const mapStore = useMapStore();
  const { deleteMarker, deleteRoute } = isSharedMode ? {
    deleteMarker: () => {},
    deleteRoute: () => {}
  } : mapStore;
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { Title, Text } = Typography;
  
  // Determine if it's a marker or route to access the correct properties
  const isMarker = type === 'marker';
  const name = isMarker 
    ? (feature as Marker).marker_name 
    : (feature as Route).route_name;
  const description = isMarker 
    ? (feature as Marker).marker_description 
    : (feature as Route).description;

  const MAX_DESCRIPTION_LENGTH = 150;
  const truncatedDescription = description && description.length > MAX_DESCRIPTION_LENGTH
    ? `${description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
    : description;

  // Handle delete feature
  const handleDeleteFeature = async (): Promise<void> => {
    if (isSharedMode || isDeleting) return;
    
    setIsDeleting(true);
    try {
      if (type === 'marker') {
        await markersApi.deleteMarker(feature.id);
        deleteMarker(feature.id);
        messageApi.success('Marker deleted successfully');
      } else {
        await routesApi.deleteRoute(feature.id);
        deleteRoute(feature.id);
        messageApi.success('Route deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      messageApi.error(`Failed to delete ${type}`);
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  };

  // Handle edit feature
  const handleEditFeature = (): void => {
    if (onEdit) {
      onEdit();
    }
  };

  const getBackgroundColor = (): string => {
    if (isSelected) {
      return '#e6f7ff';
    }
    return 'white';
  };

  // Define dropdown menu items
  const dropdownItems: MenuProps['items'] = [
    ...(onEdit ? [{
      key: 'edit',
      label: (
        <Space>
          <EditOutlined />
          <span>Edit</span>
        </Space>
      ),
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        handleEditFeature();
      }
    }] : []),
    {
      key: 'delete',
      label: (
        <Space>
          {isDeleting ? <Spin size="small" /> : <DeleteOutlined />}
          <span>Delete</span>
        </Space>
      ),
      danger: true,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        handleDeleteFeature();
      },
      disabled: isDeleting
    }
  ];

  return (
    <>
      {contextHolder}
      <Card
        style={{
          backgroundColor: getBackgroundColor(),
          cursor: 'pointer'
        }}
        styles={{ body: { padding: 12 } }}
      >
      <div 
        className="cursor-pointer"
        onClick={onClick}
      >
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space size={4} align="center">
              <Tooltip title={name} placement="topLeft">
                <Title level={5} style={{ margin: 0, fontSize: '14px' }} ellipsis={{ rows: 1, tooltip: false }}>{name}</Title>
              </Tooltip>
            </Space>
            {truncatedDescription && 
              <Tooltip title={description} placement="topLeft">
                <Text type="secondary" style={{ fontSize: '12px' }}>{truncatedDescription}</Text>
              </Tooltip>
            }
          </Space>
          
          {!isSharedMode && (
            <Dropdown 
              menu={{ items: dropdownItems }} 
              trigger={['click']}
              overlayStyle={{ zIndex: 1050 }}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ marginTop: '2px' }}
              />
            </Dropdown>
          )}
        </Space>
      </div>  
    </Card>
    </>
  );
});

// Set display name for React DevTools
FeatureItem.displayName = 'FeatureItem';

export default FeatureItem;
