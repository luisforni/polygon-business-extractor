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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{business.name}</h3>
          {business.address && (
            <p className="text-xs text-gray-500 mt-0.5">{business.address}</p>
          )}
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 shrink-0">
          {SECTOR_LABELS[business.sector] ?? business.sector}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        {business.rating && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            {business.rating.toFixed(1)}
            {business.rating_count && ` (${business.rating_count})`}
          </span>
        )}
        {business.phone && (
          <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-primary-600">
            <Phone size={12} /> {business.phone}
          </a>
        )}
        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary-600"
          >
            <Globe size={12} /> Web
          </a>
        )}
      </div>
      <div className="mt-1.5 text-xs text-gray-400">
        via {business.provider}
      </div>
    </div>
  );
}

export default function SearchTab() {
  const { searches, activeTabId } = useSearchesStore();
  const search = searches.find((s) => s.id === activeTabId);

  if (!search?.result) return null;

  const { businesses, total, providers_used } = search.result;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-900">{search.name}</h2>
          <p className="text-xs text-gray-500">
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
          <p className="text-center text-gray-400 mt-8 text-sm">
            No se encontraron comercios en esa zona.
          </p>
        )}
      </div>
    </div>
  );
}
