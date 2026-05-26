"use client";

import { useCallback, useRef, useState } from "react";
import { Menu } from "lucide-react";
import MapContainer from "@/components/Map/MapContainer";
import SearchTabList from "@/components/SearchTabs/SearchTabList";
import SearchTab from "@/components/SearchTabs/SearchTab";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useSearchesStore } from "@/store/searches";
import { useTheme } from "@/hooks/useTheme";
import { searchBusinesses } from "@/lib/api";
import type { SearchResult } from "@/types";

export default function Home() {
  const { addSearch, searches } = useSearchesStore();
  const { dark, toggle } = useTheme();

  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [lastPolygon, setLastPolygon] = useState<number[][] | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [reSearching, setReSearching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Track committed sectors (the ones used in the last search)
  const committedSectorsRef = useRef<string[]>([]);

  const handleSearchResult = useCallback(
    async (polygon: number[][], result: SearchResult) => {
      setLastPolygon(polygon);
      committedSectorsRef.current = [...selectedSectors];
      setIsDirty(false);
      await addSearch(polygon, selectedSectors, result);
    },
    [addSearch, selectedSectors]
  );

  const handleSectorsChange = (sectors: string[]) => {
    setSelectedSectors(sectors);
    if (lastPolygon) {
      const same =
        sectors.length === committedSectorsRef.current.length &&
        sectors.every((s) => committedSectorsRef.current.includes(s));
      setIsDirty(!same);
    }
  };

  const handleReSearch = async () => {
    if (!lastPolygon) return;
    setReSearching(true);
    try {
      const result = await searchBusinesses(lastPolygon, selectedSectors);
      committedSectorsRef.current = [...selectedSectors];
      setIsDirty(false);
      await addSearch(lastPolygon, selectedSectors, result);
    } finally {
      setReSearching(false);
    }
  };

  const hasTabs = searches.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-80 shrink-0 transition-transform duration-200 lg:static lg:translate-x-0 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar
          selectedSectors={selectedSectors}
          onChange={handleSectorsChange}
          dark={dark}
          onToggleDark={toggle}
          hasPolygon={!!lastPolygon}
          isDirty={isDirty}
          reSearching={reSearching}
          onReSearch={handleReSearch}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main area: map + results */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Polygon Business Extractor
          </span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className={hasTabs ? "flex-1 min-w-0 h-full" : "w-full h-full"}>
            <MapContainer
              onSearchResult={handleSearchResult}
              selectedSectors={selectedSectors}
            />
          </div>

          {/* Results panel */}
          {hasTabs && (
            <div className="w-80 shrink-0 h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <SearchTabList />
              <div className="flex-1 overflow-hidden">
                <SearchTab />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
