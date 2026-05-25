"use client";

import type { Business } from "@/types";
import { Download } from "lucide-react";

interface ExportButtonProps {
  businesses: Business[];
  searchName: string;
}

export default function ExportButton({ businesses, searchName }: ExportButtonProps) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(businesses, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${searchName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = ["name", "sector", "address", "phone", "website", "rating", "provider"];
    const rows = businesses.map((b) =>
      [b.name, b.sector, b.address ?? "", b.phone ?? "", b.website ?? "",
       b.rating ?? "", b.provider].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${searchName.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Exportar:</span>
      <button
        onClick={exportJson}
        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
      >
        <Download size={12} /> JSON
      </button>
      <button
        onClick={exportCsv}
        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
      >
        <Download size={12} /> CSV
      </button>
      {/* AI Agent export button — wired when ai-agent package is ready */}
      <button
        disabled
        title="Disponible cuando el módulo IA esté listo"
        className="flex items-center gap-1 text-xs bg-primary-50 text-primary-400 rounded px-2 py-1 cursor-not-allowed opacity-60"
      >
        <Download size={12} /> Enviar a IA
      </button>
    </div>
  );
}
