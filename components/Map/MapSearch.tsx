'use client';

import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useSearchStore } from '@/stores';
import type { SearchResult } from '@/types';
import MapSearchResult from './MapSearchResult';

interface OnLocationSelectParams {
  coordinates: [number, number];
  result: SearchResult;
}

interface MapSearchProps {
  sidebarCollapsed: boolean;
  sidebarWidth?: number;
  onLocationSelect: (params: OnLocationSelectParams) => void;
}

const MapSearch: React.FC<MapSearchProps> = ({ 
  sidebarCollapsed,
  sidebarWidth = 416, // Default width (26rem = 416px)
  onLocationSelect 
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const { addToHistory, getFilteredHistory } = useSearchStore();

  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if input is coordinates in format of "latitude, longitude" or "latitude longitude"
  const isCoordinates = (query: string): [number, number] | null => {
    // Regex to match various coordinate formats like "35.6812, 139.7671" or "35.6812 139.7671"
    const coordRegex = /^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/;
    const match = query.match(coordRegex);
    
    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      
      // Validate the coordinate ranges
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        return [latitude, longitude];
      }
    }
    
    return null;
  };

  // Search for places using Mapbox Geocoding API or handle coordinate input
  const searchPlaces = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Check if input is coordinates
    const coordinates = isCoordinates(query.trim());
    if (coordinates) {
      // If coordinates, create a synthetic result
      const [latitude, longitude] = coordinates;
      const syntheticResult: SearchResult = {
        id: `coords-${latitude}-${longitude}`,
        text: `Coordinates: ${latitude}, ${longitude}`,
        place_name: `${latitude}, ${longitude}`,
        place_type: ['coordinates'],
        center: [latitude, longitude] // Leaflet format is [latitude, longitude]
      };
      
      // Set as single result
      setResults([syntheticResult]);
      setShowResults(true);
      setIsLoading(false);
      return;
    }

    // Regular search with Mapbox API
    setIsLoading(true);
    
    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''}&limit=10&autocomplete=true`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.features) {
        setResults(data.features);
        setShowResults(true);
      }
    } catch (error: any) {
      messageApi.error('Error searching places');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPlaces(searchQuery);
      }
    }, 300); // Reduced to 300ms per design doc

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle location selection
  const handleLocationSelect = (result: SearchResult): void => {
    // Add to search history
    addToHistory(result);

    // Convert coordinates from Mapbox format [longitude, latitude] to Leaflet format [latitude, longitude]
    // Exception: coordinates from user input are already in correct format
    let coordinates: [number, number];
    if (result.place_type.includes('coordinates')) {
      // User input coordinates are already in [latitude, longitude] format
      coordinates = result.center;
    } else {
      // Mapbox API results are in [longitude, latitude] format, need to swap
      coordinates = [result.center[1], result.center[0]];
    }

    // Call parent callback
    onLocationSelect({
      coordinates,
      result,
    });

    // Clear search and hide results
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  // Clear search input and results
  const clearSearch = (): void => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };
  

  
  // Get filtered search history based on current query
  const filteredHistory = getFilteredHistory(searchQuery);

  return (
    <>
      {contextHolder}
      <div 
        ref={searchRef} 
        className="absolute top-4 z-10 flex flex-col items-start transition-all duration-300"
        style={{
          left: sidebarCollapsed ? '1rem' : `${sidebarWidth + 16}px` // 16px = 1rem margin
        }}
      >
      <div className="flex items-center bg-white shadow-md rounded-md transition-all duration-200 w-[24rem]">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            className="h-10 px-10 w-full outline-none text-gray-700 border-0 bg-transparent"
            placeholder="Search for places or addresses"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {searchQuery && (
              <button 
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Search Results Component */}
      <MapSearchResult 
        results={results}
        filteredHistory={filteredHistory}
        showResults={showResults}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSelectLocation={handleLocationSelect}
      />
    </div>
    </>
  );
};

export default MapSearch;
