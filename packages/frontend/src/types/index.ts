export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Business {
  id: string;
  name: string;
  sector: string;
  address?: string;
  coordinates?: Coordinates;
  phone?: string;
  website?: string;
  rating?: number;
  rating_count?: number;
  hours?: Record<string, string>;
  provider: string;
  provider_id: string;
  extra: Record<string, unknown>;
}

export interface SearchResult {
  businesses: Business[];
  total: number;
  providers_used: string[];
  sectors_found: string[];
  provider_errors: Record<string, string>;
}

export interface SavedSearch {
  id: string;
  name: string;
  polygon: number[][];
  sectors: string[];
  created_at: string;
  result?: SearchResult;
}
