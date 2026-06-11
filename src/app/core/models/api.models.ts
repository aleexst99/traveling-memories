// ── Modelos exactos del backend ───────────────────────────

export interface ApiToken {
  access_token: string;
  token_type:   string;
}

export interface ApiUserCreate {
  name: string;
  password: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface ApiUser {
  id: number;
  name: string;
  avatar_url?: string | null;  // la API devuelve null cuando no hay foto
  bio?: string | null;
}

export interface ApiUserUpdate {
  name?: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface ApiTripCreate {
  title: string;
  user_id: number;
  cover_photo_url?: string;
  summary?: string;
  is_wishlist: boolean;
  start_date?: string;
  end_date?: string;
  lat?: number | null;
  lng?: number | null;
  continent?: string | null;
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
  lat?: number | null;
  lng?: number | null;
  continent?: string | null;
}

export interface ApiTripEntryCreate {
  trip_id: number;
  title: string;
  content: string;
  entry_date: string;
  image_url?: string;
}

export interface ApiTripEntryOut {
  id: number;
  trip_id: number;
  title: string;
  content: string;
  entry_date: string;
  image_url?: string;
}

