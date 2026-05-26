"use client";

import type { Business } from "@/types";
import { Download } from "lucide-react";

interface ExportButtonProps {
  businesses: Business[];
  searchName: string;
}

const btnClass =
  "flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors";

export default function ExportButton({ businesses, searchName }: ExportButtonProps) {
  const slug = searchName.replace(/\s+/g, "_");

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(businesses, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = ["name", "sector", "address", "phone", "website", "rating", "provider"];
    const rows = businesses.map((b) =>
      [b.name, b.sector, b.address ?? "", b.phone ?? "", b.website ?? "", b.rating ?? "", b.provider]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-400 dark:text-gray-500">Exportar:</span>
      <button onClick={exportJson} className={btnClass}>
        <Download size={12} /> JSON
      </button>
      <button onClick={exportCsv} className={btnClass}>
        <Download size={12} /> CSV
      </button>
      <button
        disabled
        title="Disponible cuando el módulo IA esté listo"
        className="flex items-center gap-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-400 dark:text-blue-400 rounded px-2 py-1 cursor-not-allowed opacity-60"
      >
        <Download size={12} /> Enviar a IA
      </button>
    </div>
  );
}
