"use client";

import { useEffect, useState } from "react";
import { fetchSectors } from "@/lib/api";
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

interface SectorFilterProps {
  selected: string[];
  onChange: (sectors: string[]) => void;
}

export default function SectorFilter({ selected, onChange }: SectorFilterProps) {
  const [sectors, setSectors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => {});
  }, []);

  const toggle = (sector: string) => {
    onChange(
      selected.includes(sector)
        ? selected.filter((s) => s !== sector)
        : [...selected, sector]
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium shadow-md hover:bg-gray-50"
      >
        <span>Rubros</span>
        {selected.length > 0 && (
          <span className="bg-primary-500 text-white rounded-full text-xs px-1.5 py-0.5">
            {selected.length}
          </span>
        )}
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-[1001]">
          <div className="p-2 border-b flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Filtrar por rubro</span>
            {selected.length > 0 && (
              <button onClick={() => onChange([])} className="text-xs text-red-500 hover:underline">
                Limpiar
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {sectors.map((sector) => (
              <li key={sector}>
                <button
                  onClick={() => toggle(sector)}
                  className={clsx(
                    "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2",
                    selected.includes(sector) && "bg-primary-50 text-primary-700"
                  )}
                >
                  <span
                    className={clsx(
                      "w-4 h-4 rounded border flex items-center justify-center text-xs",
                      selected.includes(sector)
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "border-gray-300"
                    )}
                  >
                    {selected.includes(sector) && "✓"}
                  </span>
                  {SECTOR_LABELS[sector] ?? sector}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
