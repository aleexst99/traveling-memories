// ── Modelos exactos del backend ───────────────────────────

export interface ApiUser {
  id: number;
  name: string;
  avatar_url?: string;
  bio?: string;
}

export interface ApiTripCreate {
  title: string;
  user_id: number;
  cover_photo_url?: string;
  summary?: string;
  is_wishlist: boolean;
  start_date?: string;
  end_date?: string;
}

export interface ApiTripOut {
  id: number;
  title: string;
  user_id: number;
  cover_photo_url?: string;
  summary?: string;
  is_wishlist: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface ApiTripEntryCreate {
  trip_id: number;
  title: string;
  content: string;
  entry_date: string;
}

export interface ApiTripEntryOut {
  id: number;
  trip_id: number;
  title: string;
  content: string;
  entry_date: string;
}

