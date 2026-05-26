"use client";

import { useState } from "react";
import { useSearchesStore } from "@/store/searches";
import type { Business } from "@/types";
import { Globe, Phone, Star } from "lucide-react";
import ExportButton from "../Export/ExportButton";
import clsx from "clsx";

const SECTOR_LABELS: Record<string, string> = {
  food_drink: "Gastronomía",
  retail: "Comercios",
  health: "Salud",
  education: "Educación",
  finance: "Finanzas",
  transport: "Transporte",
  accommodation: "Hospedaje",
  entertainment: "Entretenimiento",
  services: "Servicios",
  other: "Otros",
};

function BusinessCard({ business }: { business: Business }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900 transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{business.name}</h3>
          {business.address && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{business.address}</p>
          )}
        </div>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded px-2 py-0.5 shrink-0">
          {SECTOR_LABELS[business.sector] ?? business.sector}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
        {business.rating && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            {business.rating.toFixed(1)}
            {business.rating_count && ` (${business.rating_count})`}
          </span>
        )}
        {business.phone && (
          <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-primary-500">
            <Phone size={12} /> {business.phone}
          </a>
        )}
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary-500">
            <Globe size={12} /> Web
          </a>
        )}
      </div>
      <div className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        via {business.provider}
      </div>
    </div>
  );
}

export default function SearchTab() {
  const { searches, activeTabId } = useSearchesStore();
  const search = searches.find((s) => s.id === activeTabId);
  const [activeSectors, setActiveSectors] = useState<string[]>([]);

  if (!search?.result) return null;

  const { businesses, total, providers_used, sectors_found, provider_errors } = search.result;

  const toggleSector = (sector: string) =>
    setActiveSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );

  const filtered =
    activeSectors.length > 0 ? businesses.filter((b) => activeSectors.includes(b.sector)) : businesses;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-2 shrink-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{search.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filtered.length}{activeSectors.length > 0 ? `/${total}` : ""} comercios · {providers_used.join(", ")}
            </p>
          </div>
          <ExportButton businesses={filtered} searchName={search.name} />
        </div>

        {/* Sector pills — filter client-side */}
        {sectors_found.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {sectors_found.map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={clsx(
                  "text-xs px-2 py-0.5 rounded-full border transition-colors",
                  activeSectors.includes(sector)
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500"
                )}
              >
                {SECTOR_LABELS[sector] ?? sector}
              </button>
            ))}
            {activeSectors.length > 0 && (
              <button
                onClick={() => setActiveSectors([])}
                className="text-xs text-red-500 hover:underline ml-1"
              >
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-3">
        {filtered.map((biz) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}
        {filtered.length === 0 && businesses.length > 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-8">
            Sin resultados para los rubros seleccionados.
          </p>
        )}
        {businesses.length === 0 && (
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No se encontraron comercios en esa zona.</p>
            {Object.entries(provider_errors ?? {}).map(([provider, err]) => (
              <div key={provider} className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded p-3 text-left">
                <span className="font-medium text-red-600 dark:text-red-400">{provider}:</span>{" "}
                <span className="text-red-500 dark:text-red-300">{err}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
