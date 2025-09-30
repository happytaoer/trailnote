import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchResult } from '@/types';

interface SearchState {
  searchHistory: SearchResult[];
  addToHistory: (result: SearchResult) => void;
  clearHistory: () => void;
  getFilteredHistory: (query: string) => SearchResult[];
}

/**
 * Zustand store for managing search history state
 */
export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      searchHistory: [],

      /**
       * Add a search result to history
       * Prevents duplicates and limits history to 50 items
       */
      addToHistory: (result: SearchResult): void => {
        set((state) => {
          // Check if result already exists in history
          const existingIndex = state.searchHistory.findIndex(
            (item) => item.id === result.id || 
            (item.center[0] === result.center[0] && item.center[1] === result.center[1])
          );

          let newHistory = [...state.searchHistory];

          if (existingIndex !== -1) {
            // Remove existing item and add to front
            newHistory.splice(existingIndex, 1);
          }

          // Add new result to the beginning
          newHistory.unshift(result);

          // Limit history to 50 items
          if (newHistory.length > 50) {
            newHistory = newHistory.slice(0, 50);
          }

          return {
            searchHistory: newHistory,
          };
        });
      },

      /**
       * Clear all search history
       */
      clearHistory: (): void => {
        set({ searchHistory: [] });
      },

      /**
       * Get filtered search history based on query
       * Returns items that match the search query
       */
      getFilteredHistory: (query: string): SearchResult[] => {
        const { searchHistory } = get();
        
        if (!query.trim()) {
          return searchHistory.slice(0, 5); // Return recent 5 items when no query
        }

        const lowerQuery = query.toLowerCase();
        return searchHistory.filter((item) =>
          item.text.toLowerCase().includes(lowerQuery) ||
          item.place_name.toLowerCase().includes(lowerQuery)
        ).slice(0, 5); // Limit to 5 filtered results
      },
    }),
    {
      name: 'search-history-storage',
      version: 1,
    }
  )
);
