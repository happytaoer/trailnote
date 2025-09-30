import { create } from 'zustand';

interface SelectedFeature {
  id: number;
  type: 'marker' | 'route';
}

interface FeatureToFocus {
  feature: any; // Marker | Route
  type: 'marker' | 'route';
  openInEditMode?: boolean;
}

interface SelectedFeatureState {
  selectedFeature: SelectedFeature | null;
  featureToFocus: FeatureToFocus | null;
  setSelectedFeature: (feature: SelectedFeature | null) => void;
  setFeatureToFocus: (featureToFocus: FeatureToFocus | null) => void;
  clearSelectedFeature: () => void;
  clearFeatureToFocus: () => void;
  isFeatureSelected: (id: number, type: 'marker' | 'route') => boolean;
}

export const useSelectedFeatureStore = create<SelectedFeatureState>((set, get) => ({
  selectedFeature: null,
  featureToFocus: null,
  
  setSelectedFeature: (feature: SelectedFeature | null) => {
    set({ selectedFeature: feature });
  },
  
  setFeatureToFocus: (featureToFocus: FeatureToFocus | null) => {
    set({ featureToFocus });
  },
  
  clearSelectedFeature: () => {
    set({ selectedFeature: null });
  },
  
  clearFeatureToFocus: () => {
    set({ featureToFocus: null });
  },
  
  isFeatureSelected: (id: number, type: 'marker' | 'route') => {
    const { selectedFeature } = get();
    return selectedFeature?.id === id && selectedFeature?.type === type;
  },
}));
