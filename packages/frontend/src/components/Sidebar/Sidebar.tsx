"use client";

import { useEffect, useState } from "react";
import { fetchSectors } from "@/lib/api";
import { RefreshCw, Moon, Sun, X } from "lucide-react";
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

interface SidebarProps {
  selectedSectors: string[];
  onChange: (sectors: string[]) => void;
  dark: boolean;
  onToggleDark: () => void;
  hasPolygon: boolean;
  isDirty: boolean;
  reSearching: boolean;
  onReSearch: () => void;
  onClose?: () => void;
}

export default function Sidebar({
  selectedSectors, onChange, dark, onToggleDark,
  hasPolygon, isDirty, reSearching, onReSearch, onClose,
}: SidebarProps) {
  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => { fetchSectors().then(setSectors).catch(() => {}); }, []);

  const toggle = (sector: string) =>
    onChange(
      selectedSectors.includes(sector)
        ? selectedSectors.filter((s) => s !== sector)
        : [...selectedSectors, sector]
    );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            Polygon Business<br />Extractor
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Dibujá un polígono en el mapa
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Re-search button */}
      {hasPolygon && isDirty && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onReSearch}
            disabled={reSearching}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={reSearching ? "animate-spin" : ""} />
            {reSearching ? "Buscando..." : "Buscar de nuevo"}
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
            Filtros cambiados desde la última búsqueda
          </p>
        </div>
      )}

      {/* Sector filters */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Rubros
          </span>
          {selectedSectors.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-xs text-red-500 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {selectedSectors.length === 0 ? "Todos los rubros activos" : `${selectedSectors.length} seleccionados`}
        </p>

        <ul className="space-y-1">
          {sectors.map((sector) => {
            const active = selectedSectors.includes(sector);
            return (
              <li key={sector}>
                <button
                  onClick={() => toggle(sector)}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    active
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <span className={clsx(
                    "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    active
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {active && <span className="text-[10px] leading-none">✓</span>}
                  </span>
                  {SECTOR_LABELS[sector] ?? sector}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Future modules placeholder */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          + módulo IA próximamente
        </p>
      </div>
    </div>
  );
}
