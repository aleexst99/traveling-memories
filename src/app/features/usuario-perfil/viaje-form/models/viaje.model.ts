// Interfaz para los países que vienen de RestCountries API
export interface Country {
  name: {
    common: string;
    official?: string;
  };
  ccn3: string;
  region: string;
  latlng: [number, number]; // [latitud, longitud]
}

// Interfaz para los viajes guardados
export interface Viaje {
  id: number;
  id_user: number;
  title: string;
  continent: string;
  image: string;
  description: string;
  lat?: number;
  lng?: number;
  tipo: 'wishlist' | 'realizado';
}