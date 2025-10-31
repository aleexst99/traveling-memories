export interface Viaje {
  id: number;
  title: string;
  continent: string;
  image: string;
  description?: string; // opcional para wishlist
  lat?: number;
  lng?: number;
}
