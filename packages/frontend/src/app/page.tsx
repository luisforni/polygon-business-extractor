"use client";

import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import MapContainer from "@/components/Map/MapContainer";
import SearchTabList from "@/components/SearchTabs/SearchTabList";
import SearchTab from "@/components/SearchTabs/SearchTab";
import { useSearchesStore } from "@/store/searches";
import { useTheme } from "@/hooks/useTheme";
import type { SearchResult } from "@/types";

export default function Home() {
  const { addSearch, searches } = useSearchesStore();
  const { dark, toggle } = useTheme();

  const handleSearchResult = useCallback(
    async (polygon: number[][], result: SearchResult) => {
      await addSearch(polygon, [], result);
    },
    [addSearch]
  );

  const hasTabs = searches.length > 0;

  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Polygon Business Extractor
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dibujá un polígono en el mapa para extraer comercios
          </p>
        </div>
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Cambiar tema"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={hasTabs ? "w-1/2 h-full" : "w-full h-full"}>
          <MapContainer onSearchResult={handleSearchResult} />
        </div>

        {hasTabs && (
          <div className="w-1/2 h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <SearchTabList />
            <div className="flex-1 overflow-hidden">
              <SearchTab />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
