import { create } from 'zustand';
import { Marker, Route } from '@/types';
import { markersApi, routesApi } from '@/lib/api';

interface MapState {
  markers: Marker[];
  routes: Route[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadMarkers: (projectId: number) => Promise<Marker[]>;
  loadRoutes: (projectId: number) => Promise<Route[]>;
  loadMapData: (projectId: number) => Promise<{ markers: Marker[]; routes: Route[] }>;
  
  // Marker actions
  addMarker: (marker: Marker) => void;
  updateMarker: (marker: Marker) => void;
  deleteMarker: (markerId: number) => void;
  
  // Route actions
  addRoute: (route: Route) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (routeId: number) => void;
  
  // Utility actions
  clearMapData: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  markers: [],
  routes: [],
  isLoading: false,
  error: null,

  loadMarkers: async (projectId: number): Promise<Marker[]> => {
    try {
      set({ isLoading: true, error: null });
      const markers = await markersApi.getMarkers(projectId);
      set({ markers, isLoading: false });
      return markers;
    } catch (error: any) {
      const errorMessage = `Error loading markers: ${error.message}`;
      set({ error: errorMessage, isLoading: false, markers: [] });
      throw new Error(errorMessage);
    }
  },

  loadRoutes: async (projectId: number): Promise<Route[]> => {
    try {
      set({ isLoading: true, error: null });
      const routes = await routesApi.getRoutes(projectId);
      set({ routes, isLoading: false });
      return routes;
    } catch (error: any) {
      const errorMessage = `Error loading routes: ${error.message}`;
      set({ error: errorMessage, isLoading: false, routes: [] });
      throw new Error(errorMessage);
    }
  },

  loadMapData: async (projectId: number): Promise<{ markers: Marker[]; routes: Route[] }> => {
    try {
      set({ isLoading: true, error: null });
      const [markers, routes] = await Promise.all([
        markersApi.getMarkers(projectId),
        routesApi.getRoutes(projectId)
      ]);
      set({ markers, routes, isLoading: false });
      return { markers, routes };
    } catch (error: any) {
      const errorMessage = `Error loading map data: ${error.message}`;
      set({ error: errorMessage, isLoading: false, markers: [], routes: [] });
      throw new Error(errorMessage);
    }
  },

  addMarker: (marker: Marker) => {
    set((state) => ({
      markers: [...state.markers, marker]
    }));
  },

  updateMarker: (updatedMarker: Marker) => {
    set((state) => ({
      markers: state.markers.map((marker) =>
        marker.id === updatedMarker.id ? updatedMarker : marker
      )
    }));
  },

  deleteMarker: (markerId: number) => {
    set((state) => ({
      markers: state.markers.filter((marker) => marker.id !== markerId)
    }));
  },

  addRoute: (route: Route) => {
    set((state) => ({
      routes: [...state.routes, route]
    }));
  },

  updateRoute: (updatedRoute: Route) => {
    set((state) => ({
      routes: state.routes.map((route) =>
        route.id === updatedRoute.id ? updatedRoute : route
      )
    }));
  },

  deleteRoute: (routeId: number) => {
    set((state) => ({
      routes: state.routes.filter((route) => route.id !== routeId)
    }));
  },

  clearMapData: () => {
    set({ markers: [], routes: [], error: null, isLoading: false });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));
