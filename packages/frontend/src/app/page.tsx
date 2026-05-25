"use client";

import { useCallback } from "react";
import MapContainer from "@/components/Map/MapContainer";
import SearchTabList from "@/components/SearchTabs/SearchTabList";
import SearchTab from "@/components/SearchTabs/SearchTab";
import { useSearchesStore } from "@/store/searches";
import type { SearchResult } from "@/types";

export default function Home() {
  const { addSearch, searches } = useSearchesStore();

  const handleSearchResult = useCallback(
    async (polygon: number[][], result: SearchResult) => {
      await addSearch(polygon, [], result);
    },
    [addSearch]
  );

  const hasTabs = searches.length > 0;

  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">
          Polygon Business Extractor
        </h1>
        <p className="text-xs text-gray-500">
          Dibujá un polígono en el mapa para extraer comercios
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Map — always visible */}
        <div className={hasTabs ? "w-1/2 h-full" : "w-full h-full"}>
          <MapContainer onSearchResult={handleSearchResult} />
        </div>

        {/* Search results panel */}
        {hasTabs && (
          <div className="w-1/2 h-full flex flex-col border-l border-gray-200 bg-gray-50">
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
