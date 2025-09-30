'use client';

import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, NodeIndexOutlined, PlusOutlined, MinusOutlined, AimOutlined, EditOutlined, ColumnWidthOutlined, UndoOutlined } from '@ant-design/icons';

interface MapButtonProps {
  // Button event handlers
  onOpen?: () => void;
  onDrawMarker?: () => void;
  onDrawPolyline?: () => void;
  onFreehandDraw?: () => void;
  onMeasureDistance?: () => void;
  onUndoMeasurement?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocateUser?: () => void;

  // Active states
  isFreehandDrawing?: boolean;
  isMeasuring?: boolean;
  canUndo?: boolean;

  // Permission controls
  permissions?: {
    canSelectMapLayer?: boolean;
    canDrawMarker?: boolean;
    canDrawPolyline?: boolean;
    canFreehandDraw?: boolean;
    canMeasureDistance?: boolean;
    canZoom?: boolean;
    canLocate?: boolean;
  };
}

const MapButton: React.FC<MapButtonProps> = ({
  onOpen,
  onDrawMarker,
  onDrawPolyline,
  onFreehandDraw,
  onMeasureDistance,
  onUndoMeasurement,
  onZoomIn,
  onZoomOut,
  onLocateUser,
  isFreehandDrawing = false,
  isMeasuring = false,
  canUndo = false,
  permissions = {
    canSelectMapLayer: true,
    canDrawMarker: true,
    canDrawPolyline: true,
    canFreehandDraw: true,
    canMeasureDistance: true,
    canZoom: true,
    canLocate: true
  }
}) => {
  // Common button style
  const buttonStyle = { width: 34, height: 34, padding: 0 };
  
  return (
    <Space direction="horizontal" size={8}>
      {permissions.canDrawMarker && onDrawMarker && (
        <Tooltip title="Draw Marker">
          <Button
            className="leaflet-draw-btn"
            icon={<EnvironmentOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onDrawMarker}
            style={buttonStyle}
            aria-label="Draw Marker"
          />
        </Tooltip>
      )}
      
      {permissions.canDrawPolyline && onDrawPolyline && (
        <Tooltip title="Draw Polyline">
          <Button
            className="leaflet-draw-btn"
            icon={<NodeIndexOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onDrawPolyline}
            style={buttonStyle}
            aria-label="Draw Polyline"
          />
        </Tooltip>
      )}
      
      {permissions.canFreehandDraw && onFreehandDraw && (
        <Tooltip title={isFreehandDrawing ? "Exit Freehand Draw (ESC)" : "Freehand Draw (Beta)"}>
          <Button
            className={`leaflet-draw-btn ${isFreehandDrawing ? 'active' : ''}`}
            icon={<EditOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onFreehandDraw}
            style={buttonStyle}
            aria-label={isFreehandDrawing ? "Exit Freehand Drawing Mode" : "Enter Freehand Drawing Mode"}
            aria-pressed={isFreehandDrawing}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFreehandDraw();
              }
            }}
          />
        </Tooltip>
      )}
      
      {permissions.canMeasureDistance && onMeasureDistance && (
        <Tooltip title={isMeasuring ? "Exit Measure Distance (ESC)" : "Measure Distance"}>
          <Button
            className={`leaflet-draw-btn ${isMeasuring ? 'active' : ''}`}
            icon={<ColumnWidthOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onMeasureDistance}
            style={buttonStyle}
            aria-label={isMeasuring ? "Exit Measure Distance Mode" : "Enter Measure Distance Mode"}
            aria-pressed={isMeasuring}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onMeasureDistance();
              }
            }}
          />
        </Tooltip>
      )}

      {canUndo && onUndoMeasurement && (
        <Tooltip title="Undo Last Measurement (Ctrl+Z)">
          <Button
            className="leaflet-draw-btn"
            icon={<UndoOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onUndoMeasurement}
            style={buttonStyle}
            aria-label="Undo Last Measurement"
          />
        </Tooltip>
      )}
      
      {permissions.canSelectMapLayer && onOpen && (
        <Tooltip title="Select Map Layer">
          <Button
            className="leaflet-draw-btn"
            icon={<GlobalOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onOpen}
            style={buttonStyle}
            aria-label="Select Map Layer"
          />
        </Tooltip>
      )}
      
      {permissions.canZoom && onZoomIn && (
        <Tooltip title="Zoom In">
          <Button
            className="leaflet-draw-btn"
            icon={<PlusOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onZoomIn}
            style={buttonStyle}
            aria-label="Zoom In"
          />
        </Tooltip>
      )}
      
      {permissions.canZoom && onZoomOut && (
        <Tooltip title="Zoom Out">
          <Button
            className="leaflet-draw-btn"
            icon={<MinusOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onZoomOut}
            style={buttonStyle}
            aria-label="Zoom Out"
          />
        </Tooltip>
      )}
      
      {permissions.canLocate && onLocateUser && (
        <Tooltip title="My Location">
          <Button
            className="leaflet-draw-btn"
            icon={<AimOutlined className="map-icon" style={{ fontSize: 20 }} />}
            onClick={onLocateUser}
            style={buttonStyle}
            aria-label="My Location"
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default MapButton;

// Add style for icon color
if (typeof window !== 'undefined') {
  const styleId = 'mapbutton-icon-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .map-icon {
        color: #222 !important;
        transition: color 0.2s;
      }
      .leaflet-draw-btn:hover .map-icon {
        color: #1677ff !important;
      }
      .leaflet-draw-btn.active {
        background-color: #1677ff !important;
        border-color: #1677ff !important;
      }
      .leaflet-draw-btn.active .map-icon {
        color: white !important;
      }
    `;
    document.head.appendChild(style);
  }
}
