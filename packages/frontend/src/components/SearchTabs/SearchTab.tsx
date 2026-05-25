"use client";

import { useSearchesStore } from "@/store/searches";
import type { Business } from "@/types";
import { Globe, Phone, Star } from "lucide-react";
import ExportButton from "../Export/ExportButton";

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

  if (!search?.result) return null;

  const { businesses, total, providers_used, provider_errors } = search.result;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{search.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {total} comercios · proveedores: {providers_used.join(", ")}
          </p>
        </div>
        <ExportButton businesses={businesses} searchName={search.name} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-3">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}
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
