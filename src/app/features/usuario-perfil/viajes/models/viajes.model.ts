export interface Country {
  name: {
    common: string;
    official?: string;
  };
  ccn3: string;
  region: string;
  latlng: [number, number];
}

export interface Entrada {
  id: number;
  id_viaje: number;
  title: string;
  fecha?: string;
  dias?: number;
  description?: string;
  image?: string;
}

export interface Viaje {
  id: number;
  id_user: number;
  title: string;
  continent: string;
  image: string;           // alias local de cover_photo_url
  description?: string;    // alias local de summary
  start_date?: string;     // fecha inicio (YYYY-MM-DD)
  end_date?: string;       // fecha fin   (YYYY-MM-DD)
  lat?: number;
  lng?: number;
  tipo?: 'wishlist' | 'realizado';
  entradas?: Entrada[];
}

// INTERFAZ
export interface ViajeConUsuario extends Viaje {
  userName: string; // Nombre del usuario dueño del viaje
  tipo: 'wishlist' | 'realizado'; // Compatible con la interfaz original
  userPhoto: string
}
