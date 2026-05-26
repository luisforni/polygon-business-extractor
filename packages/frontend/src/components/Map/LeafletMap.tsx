"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { searchBusinesses } from "@/lib/api";
import type { Business, SearchResult } from "@/types";

const SECTOR_COLORS: Record<string, string> = {
  food_drink: "#f97316",
  retail: "#3b82f6",
  health: "#ef4444",
  education: "#8b5cf6",
  finance: "#22c55e",
  transport: "#06b6d4",
  accommodation: "#eab308",
  entertainment: "#ec4899",
  services: "#14b8a6",
  other: "#94a3b8",
};

interface LeafletMapProps {
  onSearchResult: (polygon: number[][], result: SearchResult) => void;
  selectedSectors: string[];
  businesses: Business[];
  selectedBusinessId: string | null;
  onBusinessSelect: (id: string) => void;
}

export default function LeafletMap({
  onSearchResult, selectedSectors, businesses, selectedBusinessId, onBusinessSelect,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs so handlers always read the latest value without stale closures
  const selectedSectorsRef = useRef<string[]>([]);
  const onSearchResultRef = useRef(onSearchResult);
  const onBusinessSelectRef = useRef(onBusinessSelect);

  useEffect(() => { selectedSectorsRef.current = selectedSectors; }, [selectedSectors]);
  useEffect(() => { onSearchResultRef.current = onSearchResult; }, [onSearchResult]);
  useEffect(() => { onBusinessSelectRef.current = onBusinessSelect; }, [onBusinessSelect]);

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
      markersRef.current.forEach((m: L.CircleMarker) => m.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync business markers whenever the list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const newIds = new Set(businesses.map((b) => b.id));

    markersRef.current.forEach((marker: L.CircleMarker, id: string) => {
      if (!newIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    for (const biz of businesses) {
      if (!biz.coordinates || markersRef.current.has(biz.id)) continue;
      const color = SECTOR_COLORS[biz.sector] ?? SECTOR_COLORS.other;
      const marker = L.circleMarker([biz.coordinates.lat, biz.coordinates.lng], {
        radius: 6,
        fillColor: color,
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85,
      });
      marker.bindTooltip(biz.name, { permanent: false, direction: "top", offset: [0, -8] });
      marker.on("click", () => onBusinessSelectRef.current(biz.id));
      marker.addTo(map);
      markersRef.current.set(biz.id, marker);
    }
  }, [businesses]);

  // Highlight selected marker and pan to it
  useEffect(() => {
    markersRef.current.forEach((marker: L.CircleMarker, id: string) => {
      if (id === selectedBusinessId) {
        marker.setRadius(10);
        marker.setStyle({ weight: 3, color: "#1e40af" });
      } else {
        marker.setRadius(6);
        marker.setStyle({ weight: 1.5, color: "#fff" });
      }
    });

    if (selectedBusinessId) {
      const marker = markersRef.current.get(selectedBusinessId);
      if (marker && mapRef.current) {
        mapRef.current.panTo(marker.getLatLng(), { animate: true });
      }
    }
  }, [selectedBusinessId]);

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
