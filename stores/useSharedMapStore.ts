import { create } from 'zustand';
import { Marker, Route, Project, Image } from '@/types';

interface SharedMapState {
  project: Project | undefined;
  markers: Marker[];
  routes: Route[];
  imagesByFeature: Record<string, Image[]>;
  isLoading: boolean;
  error: string | null;
  initialMapCenter: [number, number] | null;
  
  // Actions
  setProject: (project: Project | undefined) => void;
  setMarkers: (markers: Marker[]) => void;
  setRoutes: (routes: Route[]) => void;
  setImagesByFeature: (images: Record<string, Image[]>) => void;
  setInitialMapCenter: (center: [number, number] | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSharedData: () => void;
}

export const useSharedMapStore = create<SharedMapState>((set) => ({
  project: undefined,
  markers: [],
  routes: [],
  imagesByFeature: {},
  isLoading: false,
  error: null,
  initialMapCenter: null,

  setProject: (project: Project | undefined) => {
    set({ project });
  },

  setMarkers: (markers: Marker[]) => {
    set({ markers });
  },

  setRoutes: (routes: Route[]) => {
    set({ routes });
  },

  setImagesByFeature: (imagesByFeature: Record<string, Image[]>) => {
    set({ imagesByFeature });
  },

  setInitialMapCenter: (initialMapCenter: [number, number] | null) => {
    set({ initialMapCenter });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearSharedData: () => {
    set({
      project: undefined,
      markers: [],
      routes: [],
      imagesByFeature: {},
      isLoading: false,
      error: null,
      initialMapCenter: null
    });
  }
}));
