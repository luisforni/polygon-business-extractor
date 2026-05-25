import { create } from "zustand";
import type { SavedSearch, SearchResult } from "@/types";
import { createClient } from "@/lib/supabase";

interface SearchesState {
  searches: SavedSearch[];
  activeTabId: string | null;
  loading: boolean;
  setActiveTab: (id: string) => void;
  loadSearches: () => Promise<void>;
  addSearch: (polygon: number[][], sectors: string[], result: SearchResult) => Promise<SavedSearch>;
  removeSearch: (id: string) => Promise<void>;
}

export const useSearchesStore = create<SearchesState>((set, get) => ({
  searches: [],
  activeTabId: null,
  loading: false,

  setActiveTab: (id) => set({ activeTabId: id }),

  loadSearches: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data } = await supabase
      .from("searches")
      .select("*")
      .order("created_at", { ascending: false });
    set({ searches: data ?? [], loading: false });
  },

  addSearch: async (polygon, sectors, result) => {
    const supabase = createClient();
    const name = `Search ${new Date().toLocaleString()}`;
    const { data, error } = await supabase
      .from("searches")
      .insert({ name, polygon, sectors, result })
      .select()
      .single();
    if (error) throw error;
    set((state) => ({
      searches: [data, ...state.searches],
      activeTabId: data.id,
    }));
    return data;
  },

  removeSearch: async (id) => {
    const supabase = createClient();
    await supabase.from("searches").delete().eq("id", id);
    set((state) => {
      const searches = state.searches.filter((s) => s.id !== id);
      const activeTabId =
        state.activeTabId === id ? (searches[0]?.id ?? null) : state.activeTabId;
      return { searches, activeTabId };
    });
  },
}));
