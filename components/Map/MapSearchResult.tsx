'use client';

import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { GiPositionMarker } from 'react-icons/gi';
import { Spin } from 'antd';
import type { SearchResult } from '@/types';

interface MapSearchResultProps {
  results: SearchResult[];
  filteredHistory: SearchResult[];
  showResults: boolean;
  isLoading: boolean;
  searchQuery: string;
  onSelectLocation: (result: SearchResult) => void;
}

/**
 * Component for displaying search results and search history in the map search interface
 */
const MapSearchResult: React.FC<MapSearchResultProps> = ({
  results,
  filteredHistory,
  showResults,
  isLoading,
  searchQuery,
  onSelectLocation,
}) => {
  // Get place type icon - using consistent color as requested
  const getPlaceTypeIcon = (placeType: string[]): React.ReactElement => {
    // Use a different icon for coordinates
    if (placeType.includes('coordinates')) {
      return <GiPositionMarker className="text-blue-500" />;
    }
    return <FaMapMarkerAlt className="text-blue-500" />;
  };

  if (!showResults) {
    return null;
  }

  // Display loading state
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-md rounded-md z-20 p-3 text-center border border-gray-100">
        <Spin size="small" />
      </div>
    );
  }

  // Display empty state when no results
  if (searchQuery.trim() && results.length === 0 && filteredHistory.length === 0) {
    return (
      <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-md rounded-md z-20 p-4 text-center border border-gray-100">
        <div className="text-gray-600 mb-1">No results found</div>
        <div className="text-xs text-gray-500">Try adjusting your search terms</div>
      </div>
    );
  }

  // If there are no results to show at all, return null
  if (filteredHistory.length === 0 && results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-md rounded-md z-20 overflow-hidden border border-gray-100">
      <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
        {/* Recent Searches Section */}
        {filteredHistory.length > 0 && (
          <>
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xs font-medium text-gray-600">Recent searches</h3>
            </div>
            {filteredHistory.slice(0, 5).map((result) => (
              <div
                key={`history-${result.id}`}
                className="p-2 hover:bg-gray-200 cursor-pointer border-b border-gray-100 transition-colors duration-150"
                onClick={() => onSelectLocation(result)}
              >
                <div className="flex items-center w-full">
                  <div className="mr-3 flex items-center justify-center">
                    <FaClock className="text-gray-400" />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <span className="text-gray-700 text-xs">
                      {result.text}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {result.place_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        
        {/* Places Section - Only show when there are search results */}
        {results.length > 0 && (
          <>
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xs font-medium text-gray-600">Places</h3>
            </div>
            {results.map((result) => (
              <div
                key={`result-${result.id}`}
                className="p-2 hover:bg-gray-200 cursor-pointer border-b border-gray-100 transition-colors duration-150"
                onClick={() => onSelectLocation(result)}
              >
                <div className="flex items-center w-full">
                  <div className="mr-3 flex items-center justify-center">
                    {getPlaceTypeIcon(result.place_type)}
                  </div>
                  <div className="flex flex-col w-full">
                    <span className="text-gray-700 text-xs">
                      {result.text}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {result.place_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MapSearchResult;
