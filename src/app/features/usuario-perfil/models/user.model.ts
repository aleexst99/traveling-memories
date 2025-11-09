import { Viaje } from '../viajes/models/viajes.model';

export interface SocialLinks {
  github: string;
  linkedin: string;
}

export interface User {
  id: number;
  name: string;
  photo: string;
  bio: string;
  social: SocialLinks;
  trips: Viaje[];
  wishlist: Viaje[];
}
