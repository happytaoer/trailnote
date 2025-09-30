'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import Image from 'next/image';
import { Modal, Radio, Space, Typography } from 'antd';
import { useAuth } from '@/hooks/useAuth';

/**
 * Thumbnail size constants for MapLayer preview
 */
const THUMBNAIL_WIDTH = 64;
const THUMBNAIL_HEIGHT = 64;

/**
 * MapLayerType represents a map overlay or tile layer.
 * @property storage_path Optional storage path for thumbnails in Supabase Storage (used to determine if image is optimized)
 */
export interface MapLayerType {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  thumbnail?: string;
  /**
   * Optional storage path for thumbnails in Supabase Storage. If absent, thumbnail is treated as an external URL.
   */
  storage_path?: string;
}

// Define available map layers
export const mapLayers: MapLayerType[] = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    thumbnail: '/openstreetmap.png'
  },
  {
    name: 'Mapbox',
    url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    thumbnail: '/mapbox_street.webp',
  },
  {
    name: 'Mapbox Satellite',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    thumbnail: '/mapbox_satellite.webp',
  },
  {
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    thumbnail: '/opentopomap.png'
  },
  {
    name: 'CycleOSM',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    thumbnail: '/cyclosm.png'
  }
];

interface MapLayerProps {
  activeLayer: MapLayerType;
  onLayerChange: (layer: MapLayerType) => void;
}

const MapLayerComponent: React.FC<MapLayerProps> = ({ activeLayer, onLayerChange }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<MapLayerType>(activeLayer);

  // Check for user settings and apply the configured layer only on initial mount or when user changes
  useEffect(() => {
    if (user?.settings?.layer) {
      const userConfiguredLayer = mapLayers.find(layer => {
        // Match by name (case-insensitive) or by normalized name
        return layer.name.toLowerCase() === user.settings?.layer.toLowerCase() ||
               layer.name.toLowerCase().replace(/\s+/g, '') === user.settings?.layer.toLowerCase().replace(/\s+/g, '');
      });
      
      if (userConfiguredLayer) {
        onLayerChange(userConfiguredLayer);
      }
    }
    // Only run when user changes or component mounts, not when activeLayer changes
  }, [user, onLayerChange]);

  // Update selected layer when active layer changes
  useEffect(() => {
    setSelectedLayer(activeLayer);
  }, [activeLayer]);

  useEffect(() => {
    const handleOpenLayerModal = () => setIsModalOpen(true);
    window.addEventListener('openLayerModal', handleOpenLayerModal);
    return () => window.removeEventListener('openLayerModal', handleOpenLayerModal);
  }, []);

  // Memoize handlers to prevent recreation on each render
  const handleOk = useCallback(() => {
    onLayerChange(selectedLayer);
    setIsModalOpen(false);
  }, [selectedLayer, onLayerChange]);

  const handleCancel = useCallback(() => {
    setSelectedLayer(activeLayer);
    setIsModalOpen(false);
  }, [activeLayer]);

  const handleLayerChange = useCallback((e: any) => {
    const layer = mapLayers.find(l => l.name === e.target.value);
    if (layer) setSelectedLayer(layer);
  }, []);

  return (
    <>
      <Modal
        title="Select Map Layer"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Confirm"
        cancelText="Cancel"
        centered
      >
        <Radio.Group 
          value={selectedLayer.name} 
          onChange={handleLayerChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {mapLayers.map(layer => (
              <Radio 
                key={layer.name} 
                value={layer.name}
                style={{ 
                  width: '100%', 
                  height: '80px', 
                  border: layer.name === selectedLayer.name ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {layer.thumbnail && (
                    <div style={{ marginRight: '12px', width: '60px', height: '60px', overflow: 'hidden' }}>
                      <Image
                        src={layer.thumbnail}
                        alt={layer.name}
                        width={THUMBNAIL_WIDTH}
                        height={THUMBNAIL_HEIGHT}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        unoptimized={!layer.storage_path}
                      />
                    </div>
                  )}
                  <div>
                    <Typography.Text strong>{layer.name}</Typography.Text>
                    <Typography.Paragraph style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                      {layer.name === 'Mapbox' && 'Mapbox Streets – modern, detailed street map'}
                      {layer.name === 'Mapbox Satellite' && 'High-resolution satellite imagery with street names and labels'}
                      {layer.name === 'OpenStreetMap' && 'Standard street map view'}
                      {layer.name === 'OpenTopoMap' && 'Topographic map with terrain features and contour lines'}
                      {layer.name === 'CycleOSM' && 'Map focused on bicycle routes and trails'}
                    </Typography.Paragraph>
                  </div>
                </div>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MapLayer = memo(MapLayerComponent);

export default MapLayer;
