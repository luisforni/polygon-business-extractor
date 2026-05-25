"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { searchBusinesses } from "@/lib/api";
import type { SearchResult } from "@/types";
import SectorFilter from "../Filters/SectorFilter";

interface LeafletMapProps {
  onSearchResult: (polygon: number[][], result: SearchResult) => void;
}

export default function LeafletMap({ onSearchResult }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([-34.6037, -58.3816], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const drawnItems = new L.FeatureGroup().addTo(map);

    // @ts-expect-error leaflet-draw types
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        rectangle: true,
        circle: false,
        polyline: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, async (e: L.DrawEvents.Created) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);

      const latlngs = (e.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
      const polygon: number[][] = latlngs.map((p) => [p.lng, p.lat]);
      polygon.push(polygon[0]); // close ring

      setSearching(true);
      setError(null);
      try {
        const result = await searchBusinesses(polygon, selectedSectors);
        onSearchResult(polygon, result);
      } catch {
        setError("Error al buscar comercios. Intentá de nuevo.");
      } finally {
        setSearching(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update handler when sectors change without re-mounting
  useEffect(() => {
    if (!mapRef.current) return;
    const handler = async (e: L.DrawEvents.Created) => {
      const latlngs = (e.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
      const polygon: number[][] = latlngs.map((p) => [p.lng, p.lat]);
      polygon.push(polygon[0]);
      setSearching(true);
      setError(null);
      try {
        const result = await searchBusinesses(polygon, selectedSectors);
        onSearchResult(polygon, result);
      } catch {
        setError("Error al buscar comercios. Intentá de nuevo.");
      } finally {
        setSearching(false);
      }
    };
    mapRef.current.off(L.Draw.Event.CREATED);
    mapRef.current.on(L.Draw.Event.CREATED, handler);
  }, [selectedSectors, onSearchResult]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full z-0" />
      <div className="absolute top-4 right-4 z-[1000]">
        <SectorFilter selected={selectedSectors} onChange={setSelectedSectors} />
      </div>
      {searching && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg px-6 py-4 shadow-xl text-sm font-medium">
            Buscando comercios...
          </div>
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
