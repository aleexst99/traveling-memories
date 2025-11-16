export interface Viaje {
  id: number;
  id_user: number;
  title: string;
  continent: string;
  image: string;
  description?: string; // opcional para wishlist
  lat?: number;
  lng?: number;
  tipo?: 'wishlist' | 'realizado';
}

// INTERFAZ
export interface ViajeConUsuario extends Viaje {
  userName: string; // Nombre del usuario dueño del viaje
  tipo: 'wishlist' | 'realizado'; // Compatible con la interfaz original
  userPhoto: string
}
