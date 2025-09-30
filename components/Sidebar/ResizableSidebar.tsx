'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';

interface ResizableSidebarProps {
  children: React.ReactNode;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  collapsed,
  onToggleCollapse,
  onWidthChange,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 416, // 26rem = 416px
}) => {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (collapsed) return;
    
    setIsResizing(true);
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [collapsed, width]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || collapsed) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    setWidth(newWidth);
  }, [isResizing, collapsed, minWidth, maxWidth]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Add a small delay before allowing click events
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
    }
  }, [isResizing]);

  // Handle click on toggle button
  const handleToggleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only toggle if we're not in the middle of a drag operation
    if (!isDragging) {
      onToggleCollapse();
    }
  }, [isDragging, onToggleCollapse]);

  // Add event listeners for mouse events
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Call onWidthChange when width changes
  useEffect(() => {
    if (onWidthChange) {
      const currentWidth = collapsed ? 0 : width;
      onWidthChange(currentWidth);
    }
  }, [width, collapsed, onWidthChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  const sidebarWidth = collapsed ? 0 : width;
  const togglePosition = collapsed ? 0 : width;

  return (
    <>
      {/* Toggle Button */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-16 bg-white rounded-tr-md rounded-br-md shadow-md cursor-pointer transition-all duration-300 z-30 hover:bg-gray-50`}
        style={{ left: `${togglePosition}px` }}
        onClick={handleToggleClick}
      >
        {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
      </div>

      {/* Sidebar Container */}
      <div
        ref={sidebarRef}
        className="absolute top-0 left-0 h-full bg-white shadow-lg z-20 flex flex-col transition-all duration-300 overflow-hidden"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Content */}
        <div 
          className="flex flex-col h-full"
          style={{ width: `${width}px` }}
        >
          {children}
        </div>

        {/* Resize Handle */}
        {!collapsed && (
          <div
            className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors duration-200 ${
              isResizing ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-300'
            }`}
            onMouseDown={handleMouseDown}
            style={{ zIndex: 31 }}
          >
            {/* Visual indicator for resize handle */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-8 bg-gray-300 rounded-l-sm opacity-0 hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}
      </div>

      {/* Overlay during resize to prevent interference */}
      {isResizing && (
        <div
          className="fixed inset-0 z-40"
          style={{ cursor: 'col-resize' }}
        />
      )}
    </>
  );
};

export default ResizableSidebar;
