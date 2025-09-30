import { create } from 'zustand';

interface LocationState {
  currentPosition: [number, number] | null;
  isLocating: boolean;
  locationError: string | null;
  lastLocationTime: number | null;
  getCurrentPosition: () => Promise<[number, number] | null>;
  clearLocationError: () => void;
  setCurrentPosition: (position: [number, number] | null) => void;
}

const LOCATION_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const useLocationStore = create<LocationState>((set, get) => ({
  currentPosition: null,
  isLocating: false,
  locationError: null,
  lastLocationTime: null,

  getCurrentPosition: async (): Promise<[number, number] | null> => {
    const state = get();
    
    // Check if we have a cached position that's still valid
    if (
      state.currentPosition && 
      state.lastLocationTime && 
      Date.now() - state.lastLocationTime < LOCATION_CACHE_DURATION
    ) {
      return state.currentPosition;
    }

    // Clear any previous error
    set({ locationError: null });

    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser.';
      set({ locationError: error });
      return null;
    }

    set({ isLocating: true });

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
      
      set({
        currentPosition: coords,
        isLocating: false,
        locationError: null,
        lastLocationTime: Date.now()
      });

      return coords;
    } catch (error) {
      let errorMessage = 'Unable to retrieve your location.';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
      }

      set({
        isLocating: false,
        locationError: errorMessage,
        currentPosition: null,
        lastLocationTime: null
      });

      return null;
    }
  },

  clearLocationError: () => {
    set({ locationError: null });
  },

  setCurrentPosition: (position: [number, number] | null) => {
    set({ 
      currentPosition: position,
      lastLocationTime: position ? Date.now() : null
    });
  }
}));
