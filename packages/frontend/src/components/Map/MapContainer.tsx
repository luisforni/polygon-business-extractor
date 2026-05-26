"use client";

import dynamic from "next/dynamic";
import type { SearchResult } from "@/types";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface MapContainerProps {
  onSearchResult: (polygon: number[][], result: SearchResult) => void;
  selectedSectors: string[];
}

export default function MapContainer({ onSearchResult, selectedSectors }: MapContainerProps) {
  return (
    <div className="w-full h-full">
      <LeafletMap onSearchResult={onSearchResult} selectedSectors={selectedSectors} />
    </div>
  );
}
