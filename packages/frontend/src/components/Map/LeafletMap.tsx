"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { searchBusinesses } from "@/lib/api";
import type { SearchResult } from "@/types";

interface LeafletMapProps {
  onSearchResult: (polygon: number[][], result: SearchResult) => void;
  selectedSectors: string[];
}

export default function LeafletMap({ onSearchResult, selectedSectors }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs so the map handler always reads the latest value without needing rebinding
  const selectedSectorsRef = useRef<string[]>([]);
  const onSearchResultRef = useRef(onSearchResult);

  useEffect(() => { selectedSectorsRef.current = selectedSectors; }, [selectedSectors]);
  useEffect(() => { onSearchResultRef.current = onSearchResult; }, [onSearchResult]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;

    (window as unknown as { L: typeof L }).L = L;

    // @ts-expect-error — @types/leaflet-draw augments L but has no module export declaration
    import("leaflet-draw").then(() => {
      if (!mounted || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current).setView([40.4821, -3.3547], 4);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          mapRef.current?.setView([coords.latitude, coords.longitude], 14);
        },
        () => {}
      );

      const drawnItems = new L.FeatureGroup().addTo(map);
      map.addControl(
        new L.Control.Draw({
          draw: {
            polygon: { allowIntersection: false, showArea: true },
            rectangle: true,
            circle: false,
            polyline: false,
            marker: false,
            circlemarker: false,
          },
          edit: { featureGroup: drawnItems },
        })
      );

      map.on(L.Draw.Event.CREATED, async (e: L.DrawEvents.Created) => {
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);

        const latlngs = (e.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
        const polygon: number[][] = latlngs.map((p) => [p.lng, p.lat]);
        polygon.push(polygon[0]);

        setSearching(true);
        setError(null);
        try {
          // Read from refs — always current, no stale closure
          const result = await searchBusinesses(polygon, selectedSectorsRef.current);
          onSearchResultRef.current(polygon, result);
        } catch {
          setError("Error al buscar comercios. Intentá de nuevo.");
        } finally {
          setSearching(false);
        }
      });
    });

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full z-0" />
      {searching && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/20 dark:bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-xl text-sm font-medium text-gray-900 dark:text-gray-100">
            Buscando comercios...
          </div>
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
