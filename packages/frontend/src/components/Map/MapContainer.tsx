"use client";

import dynamic from "next/dynamic";
import type { Business, SearchResult } from "@/types";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface MapContainerProps {
  onSearchResult: (polygon: number[][], result: SearchResult) => void;
  selectedSectors: string[];
  businesses: Business[];
  selectedBusinessId: string | null;
  onBusinessSelect: (id: string) => void;
}

export default function MapContainer({
  onSearchResult, selectedSectors, businesses, selectedBusinessId, onBusinessSelect,
}: MapContainerProps) {
  return (
    <div className="w-full h-full">
      <LeafletMap
        onSearchResult={onSearchResult}
        selectedSectors={selectedSectors}
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onBusinessSelect={onBusinessSelect}
      />
    </div>
  );
}
