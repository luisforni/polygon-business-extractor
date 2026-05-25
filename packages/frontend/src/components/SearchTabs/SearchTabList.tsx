"use client";

import { useSearchesStore } from "@/store/searches";
import clsx from "clsx";
import { X } from "lucide-react";

export default function SearchTabList() {
  const { searches, activeTabId, setActiveTab, removeSearch } = useSearchesStore();

  if (searches.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-10">
      {searches.map((search) => (
        <div
          key={search.id}
          className={clsx(
            "flex items-center gap-1 px-3 py-1.5 rounded-t text-sm cursor-pointer whitespace-nowrap border-b-2 transition-colors",
            activeTabId === search.id
              ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
          onClick={() => setActiveTab(search.id)}
        >
          <span>{search.name}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
            ({search.result?.total ?? 0})
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); removeSearch(search.id); }}
            className="ml-1 text-gray-400 hover:text-red-500 rounded"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
