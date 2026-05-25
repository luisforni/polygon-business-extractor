import { create } from "zustand";
import type { SavedSearch, SearchResult } from "@/types";
import { listSearches, createSearch, deleteSearch } from "@/lib/api";

interface SearchesState {
  searches: SavedSearch[];
  activeTabId: string | null;
  loading: boolean;
  setActiveTab: (id: string) => void;
  loadSearches: () => Promise<void>;
  addSearch: (polygon: number[][], sectors: string[], result: SearchResult) => Promise<SavedSearch>;
  removeSearch: (id: string) => Promise<void>;
}

export const useSearchesStore = create<SearchesState>((set) => ({
  searches: [],
  activeTabId: null,
  loading: false,

  setActiveTab: (id) => set({ activeTabId: id }),

  loadSearches: async () => {
    set({ loading: true });
    const searches = await listSearches();
    set({ searches, loading: false });
  },

  addSearch: async (polygon, sectors, result) => {
    const name = `Búsqueda ${new Date().toLocaleString("es-AR")}`;
    const saved = await createSearch(name, polygon, sectors, result);
    set((state) => ({
      searches: [saved, ...state.searches],
      activeTabId: saved.id,
    }));
    return saved;
  },

  removeSearch: async (id) => {
    await deleteSearch(id);
    set((state) => {
      const searches = state.searches.filter((s) => s.id !== id);
      const activeTabId =
        state.activeTabId === id ? (searches[0]?.id ?? null) : state.activeTabId;
      return { searches, activeTabId };
    });
  },
}));
