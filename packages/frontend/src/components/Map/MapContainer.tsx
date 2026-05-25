"use client";

import dynamic from "next/dynamic";
import type { SearchResult } from "@/types";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

interface MapContainerProps {
  onSearchResult: (polygon: number[][], result: SearchResult) => void;
}

export default function MapContainer({ onSearchResult }: MapContainerProps) {
  return (
    <div className="w-full h-full">
      <LeafletMap onSearchResult={onSearchResult} />
    </div>
  );
}
