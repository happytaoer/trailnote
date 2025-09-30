import { create } from 'zustand';
import L from 'leaflet';

/**
 * Drawing Store - 统一管理地图绘制相关状态
 * 解决状态分散在多个组件中的问题
 */
interface DrawingState {
  // Freehand Drawing State
  isFreehandDrawing: boolean;
  currentFreehandPath: L.LatLng[];
  
  // Measurement State
  isMeasuring: boolean;
  measurePoints: L.LatLng[];
  measureLines: (L.Polyline | L.CircleMarker | L.Marker)[];
  totalDistance: number;
  canUndo: boolean;
  
  // General Drawing State
  isDrawingMode: boolean; // 是否处于任何绘制模式
  
  // Freehand Drawing Actions
  setFreehandDrawing: (isDrawing: boolean) => void;
  setCurrentFreehandPath: (path: L.LatLng[]) => void;
  addFreehandPoint: (point: L.LatLng) => void;
  clearFreehandPath: () => void;
  resetFreehandDrawing: () => void;
  
  // Measurement Actions
  setMeasuring: (isMeasuring: boolean) => void;
  setMeasurePoints: (points: L.LatLng[]) => void;
  addMeasurePoint: (point: L.LatLng) => void;
  setMeasureLines: (lines: (L.Polyline | L.CircleMarker | L.Marker)[]) => void;
  addMeasureLine: (line: L.Polyline | L.CircleMarker | L.Marker) => void;
  setTotalDistance: (distance: number) => void;
  setCanUndo: (canUndo: boolean) => void;
  clearMeasurements: () => void;
  undoLastMeasurement: () => void;
  resetMeasurement: () => void;
  
  // General Actions
  exitAllDrawingModes: () => void;
  isAnyDrawingActive: () => boolean;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // Initial State
  isFreehandDrawing: false,
  currentFreehandPath: [],
  isMeasuring: false,
  measurePoints: [],
  measureLines: [],
  totalDistance: 0,
  canUndo: false,
  isDrawingMode: false,

  // Freehand Drawing Actions
  setFreehandDrawing: (isDrawing: boolean) => {
    set((state) => ({
      isFreehandDrawing: isDrawing,
      isDrawingMode: isDrawing || state.isMeasuring
    }));
  },

  setCurrentFreehandPath: (path: L.LatLng[]) => {
    set({ currentFreehandPath: path });
  },

  addFreehandPoint: (point: L.LatLng) => {
    set((state) => ({
      currentFreehandPath: [...state.currentFreehandPath, point]
    }));
  },

  clearFreehandPath: () => {
    set({ currentFreehandPath: [] });
  },

  resetFreehandDrawing: () => {
    set((state) => ({
      isFreehandDrawing: false,
      currentFreehandPath: [],
      isDrawingMode: state.isMeasuring // 保持测量模式状态
    }));
  },

  // Measurement Actions
  setMeasuring: (isMeasuring: boolean) => {
    set((state) => ({
      isMeasuring,
      isDrawingMode: isMeasuring || state.isFreehandDrawing
    }));
  },

  setMeasurePoints: (points: L.LatLng[]) => {
    set({ measurePoints: points });
  },

  addMeasurePoint: (point: L.LatLng) => {
    set((state) => ({
      measurePoints: [...state.measurePoints, point]
    }));
  },

  setMeasureLines: (lines: (L.Polyline | L.CircleMarker | L.Marker)[]) => {
    set({ measureLines: lines });
  },

  addMeasureLine: (line: L.Polyline | L.CircleMarker | L.Marker) => {
    set((state) => ({
      measureLines: [...state.measureLines, line]
    }));
  },

  setTotalDistance: (distance: number) => {
    set({ totalDistance: distance });
  },

  setCanUndo: (canUndo: boolean) => {
    set({ canUndo });
  },

  clearMeasurements: () => {
    set({
      measurePoints: [],
      measureLines: [],
      totalDistance: 0,
      canUndo: false
    });
  },

  undoLastMeasurement: () => {
    const state = get();
    if (!state.canUndo || state.measurePoints.length === 0) return;

    const newPoints = state.measurePoints.slice(0, -1);
    const newLines = state.measureLines.slice(0, -3); // Remove last 3 layers (line, marker, label)
    
    set({
      measurePoints: newPoints,
      measureLines: newLines,
      canUndo: newPoints.length > 0
    });
  },

  resetMeasurement: () => {
    set((state) => ({
      isMeasuring: false,
      measurePoints: [],
      measureLines: [],
      totalDistance: 0,
      canUndo: false,
      isDrawingMode: state.isFreehandDrawing // 保持绘制模式状态
    }));
  },

  // General Actions
  exitAllDrawingModes: () => {
    set({
      isFreehandDrawing: false,
      currentFreehandPath: [],
      isMeasuring: false,
      measurePoints: [],
      measureLines: [],
      totalDistance: 0,
      canUndo: false,
      isDrawingMode: false
    });
  },

  isAnyDrawingActive: () => {
    const state = get();
    return state.isFreehandDrawing || state.isMeasuring;
  }
}));
