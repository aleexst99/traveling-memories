/**
 * test-endpoints.spec.ts
 *
 * Dispara todos los endpoints de la API con mocks y verifica:
 *   - método HTTP correcto
 *   - URL correcta
 *   - body enviado (en POST / PUT)
 *   - mapeo de la respuesta al modelo frontend
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import {
  ApiUser,
  ApiTripOut,
  ApiTripEntryOut,
} from '@core/models/api.models';
import { Viaje, Entrada, Country } from '@core/models/viajes.model';

// ── Fixtures ───────────────────────────────────────────────────────────────

const MOCK_API_USER: ApiUser = {
  id: 1,
  name: 'Alejandro',
  avatar_url: 'https://res.cloudinary.com/test/avatar.jpg',
  bio: 'Viajero apasionado',
};

const MOCK_TRIP_OUT: ApiTripOut = {
  id: 10,
  title: 'Francia',
  user_id: 1,
  is_wishlist: false,
  cover_photo_url: 'https://res.cloudinary.com/test/france.jpg',
  summary: 'Un viaje increíble por París',
  start_date: '2024-05-01',
  end_date: '2024-05-10',
};

const MOCK_WISHLIST_OUT: ApiTripOut = {
  id: 20,
  title: 'Japón',
  user_id: 1,
  is_wishlist: true,
};

const MOCK_ENTRY_OUT: ApiTripEntryOut = {
  id: 100,
  trip_id: 10,
  title: 'París',
  content: 'Ciudad de la luz',
  entry_date: '2024-05-02',
  image_url: 'https://res.cloudinary.com/test/paris.jpg',
};

const MOCK_VIAJE: Viaje = {
  id: 10,
  id_user: 1,
  title: 'Francia',
  continent: 'Europa',
  image: 'https://res.cloudinary.com/test/france.jpg',
  description: 'Un viaje increíble por París',
  tipo: 'realizado',
};

const MOCK_ENTRADA: Entrada = {
  id: 100,
  id_viaje: 10,
  title: 'París',
  description: 'Ciudad de la luz',
  fecha: '2024-05-02',
  image: 'https://res.cloudinary.com/test/paris.jpg',
};

// ── Suite ──────────────────────────────────────────────────────────────────

describe('ApiService — todos los endpoints', () => {
  let service: ApiService;
  let http: HttpTestingController;
  const BASE = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
    // El servicio precarga countries.json en el constructor
    http.expectOne('assets/countries.json').flush([]);
  });

  afterEach(() => http.verify()); // asegura que no quedan peticiones sin atender

  // ── GET /users ─────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('hace GET a /users y devuelve lista de usuarios mapeados', () => {
      service.getUsers().subscribe(users => {
        expect(users.length).toBe(2);
        expect(users[0].name).toBe('Alejandro');
        expect(users[1].name).toBe('Arturo');
      });

      const req = http.expectOne(`${BASE}/users`);
      expect(req.request.method).toBe('GET');
      req.flush({
        response: [
          MOCK_API_USER,
          { id: 2, name: 'Arturo', avatar_url: undefined, bio: '' },
        ],
      });
    });
  });

  // ── GET /users/:id ─────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('hace GET a /users/1 y devuelve el usuario mapeado', () => {
      service.getUser(1).subscribe(user => {
        expect(user.id).toBe(1);
        expect(user.name).toBe('Alejandro');
        expect(user.photo).toBe('https://res.cloudinary.com/test/avatar.jpg');
        expect(user.bio).toBe('Viajero apasionado');
      });

      const req = http.expectOne(`${BASE}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_API_USER);
    });

    it('genera avatar con iniciales cuando avatar_url es null', () => {
      service.getUser(2).subscribe(user => {
        expect(user.photo).toContain('data:image/svg+xml;base64,');
      });

      const req = http.expectOne(`${BASE}/users/2`);
      req.flush({ id: 2, name: 'Arturo', avatar_url: null });
    });
  });

  // ── GET /trips/user/:id ────────────────────────────────────────────────

  describe('GET /trips/user/:id', () => {
    it('hace GET a /trips/user/1 y devuelve viajes mapeados', () => {
      service.getTripsByUser(1).subscribe(viajes => {
        expect(viajes.length).toBe(2);
        expect(viajes[0].tipo).toBe('realizado');
        expect(viajes[1].tipo).toBe('wishlist');
      });

      const req = http.expectOne(`${BASE}/trips/user/1`);
      expect(req.request.method).toBe('GET');
      req.flush([MOCK_TRIP_OUT, MOCK_WISHLIST_OUT]);
    });

    it('devuelve array vacío si el usuario no tiene viajes', () => {
      service.getTripsByUser(99).subscribe(viajes => {
        expect(viajes).toEqual([]);
      });

      const req = http.expectOne(`${BASE}/trips/user/99`);
      req.flush([]);
    });
  });

  // ── GET /trips/:id ─────────────────────────────────────────────────────

  describe('GET /trips/:id', () => {
    it('hace GET a /trips/10 y devuelve el viaje mapeado', () => {
      service.getTrip(10).subscribe(viaje => {
        expect(viaje.id).toBe(10);
        expect(viaje.title).toBe('Francia');
        expect(viaje.image).toBe('https://res.cloudinary.com/test/france.jpg');
        expect(viaje.start_date).toBe('2024-05-01');
      });

      const req = http.expectOne(`${BASE}/trips/10`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_TRIP_OUT);
    });
  });

  // ── POST /trips ────────────────────────────────────────────────────────

  describe('POST /trips', () => {
    it('hace POST a /trips con el body correcto y devuelve el viaje', () => {
      service.createTrip(MOCK_VIAJE).subscribe(viaje => {
        expect(viaje.id).toBe(10);
        expect(viaje.title).toBe('Francia');
        expect(viaje.tipo).toBe('realizado');
      });

      const req = http.expectOne(`${BASE}/trips`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe('Francia');
      expect(req.request.body.user_id).toBe(1);
      expect(req.request.body.is_wishlist).toBeFalse();
      expect(req.request.body.cover_photo_url).toBe('https://res.cloudinary.com/test/france.jpg');
      req.flush(MOCK_TRIP_OUT);
    });

    it('envía is_wishlist true para viajes de tipo wishlist', () => {
      const wishlist: Viaje = { ...MOCK_VIAJE, tipo: 'wishlist' };
      service.createTrip(wishlist).subscribe();

      const req = http.expectOne(`${BASE}/trips`);
      expect(req.request.body.is_wishlist).toBeTrue();
      req.flush({ ...MOCK_TRIP_OUT, is_wishlist: true });
    });
  });

  // ── PUT /trips/:id ─────────────────────────────────────────────────────

  describe('PUT /trips/:id', () => {
    it('hace PUT a /trips/10 con el body actualizado', () => {
      const actualizado: Viaje = { ...MOCK_VIAJE, description: 'Descripción actualizada' };
      service.updateTrip(10, actualizado).subscribe(viaje => {
        expect(viaje.id).toBe(10);
        expect(viaje.description).toBe('Un viaje increíble por París');
      });

      const req = http.expectOne(`${BASE}/trips/10`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.title).toBe('Francia');
      expect(req.request.body.user_id).toBe(1);
      req.flush(MOCK_TRIP_OUT);
    });

    it('puede cambiar tipo a wishlist vía PUT', () => {
      const wishlist: Viaje = { ...MOCK_VIAJE, tipo: 'wishlist' };
      service.updateTrip(10, wishlist).subscribe(viaje => {
        expect(viaje.tipo).toBe('wishlist');
      });

      const req = http.expectOne(`${BASE}/trips/10`);
      expect(req.request.body.is_wishlist).toBeTrue();
      req.flush({ ...MOCK_TRIP_OUT, is_wishlist: true });
    });
  });

  // ── GET /trip-entries/trip/:id ─────────────────────────────────────────

  describe('GET /trip-entries/trip/:id', () => {
    it('hace GET a /trip-entries/trip/10 y devuelve entradas mapeadas', () => {
      service.getEntriesByTrip(10).subscribe(entradas => {
        expect(entradas.length).toBe(2);
        expect(entradas[0].title).toBe('París');
        expect(entradas[0].image).toBe('https://res.cloudinary.com/test/paris.jpg');
        expect(entradas[1].title).toBe('Lyon');
      });

      const req = http.expectOne(`${BASE}/trip-entries/trip/10`);
      expect(req.request.method).toBe('GET');
      req.flush([
        MOCK_ENTRY_OUT,
        { id: 101, trip_id: 10, title: 'Lyon', content: 'Gastronomía', entry_date: '2024-05-05' },
      ]);
    });

    it('devuelve array vacío si el viaje no tiene entradas', () => {
      service.getEntriesByTrip(99).subscribe(entradas => {
        expect(entradas).toEqual([]);
      });

      const req = http.expectOne(`${BASE}/trip-entries/trip/99`);
      req.flush([]);
    });
  });

  // ── POST /trip-entries ─────────────────────────────────────────────────

  describe('POST /trip-entries', () => {
    it('hace POST a /trip-entries con el body correcto', () => {
      service.createEntry(MOCK_ENTRADA).subscribe(entrada => {
        expect(entrada.id).toBe(100);
        expect(entrada.title).toBe('París');
        expect(entrada.image).toBe('https://res.cloudinary.com/test/paris.jpg');
      });

      const req = http.expectOne(`${BASE}/trip-entries`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.trip_id).toBe(10);
      expect(req.request.body.title).toBe('París');
      expect(req.request.body.content).toBe('Ciudad de la luz');
      expect(req.request.body.entry_date).toBe('2024-05-02');
      expect(req.request.body.image_url).toBe('https://res.cloudinary.com/test/paris.jpg');
      req.flush(MOCK_ENTRY_OUT);
    });

    it('usa la fecha de hoy si no se proporciona fecha', () => {
      const sin_fecha: Entrada = { id: 0, id_viaje: 10, title: 'Sin fecha' };
      service.createEntry(sin_fecha).subscribe();

      const req = http.expectOne(`${BASE}/trip-entries`);
      const today = new Date().toISOString().split('T')[0];
      expect(req.request.body.entry_date).toBe(today);
      req.flush({ id: 200, trip_id: 10, title: 'Sin fecha', content: '', entry_date: today });
    });

    it('envía image_url undefined si la entrada no tiene imagen', () => {
      const sin_imagen: Entrada = { id: 0, id_viaje: 10, title: 'Sin imagen', fecha: '2024-06-01' };
      service.createEntry(sin_imagen).subscribe();

      const req = http.expectOne(`${BASE}/trip-entries`);
      expect(req.request.body.image_url).toBeUndefined();
      req.flush({ id: 201, trip_id: 10, title: 'Sin imagen', content: '', entry_date: '2024-06-01' });
    });
  });

  // ── PUT /trip-entries/:id ──────────────────────────────────────────────

  describe('PUT /trip-entries/:id', () => {
    it('hace PUT a /trip-entries/100 con el body actualizado', () => {
      const actualizada: Entrada = { ...MOCK_ENTRADA, description: 'Descripción actualizada' };
      service.updateEntry(100, actualizada).subscribe(entrada => {
        expect(entrada.id).toBe(100);
        expect(entrada.title).toBe('París');
      });

      const req = http.expectOne(`${BASE}/trip-entries/100`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.trip_id).toBe(10);
      expect(req.request.body.title).toBe('París');
      expect(req.request.body.content).toBe('Descripción actualizada');
      expect(req.request.body.entry_date).toBe('2024-05-02');
      req.flush(MOCK_ENTRY_OUT);
    });
  });

  // ── DELETE /trip-entries/:id ───────────────────────────────────────────

  describe('DELETE /trip-entries/:id', () => {
    it('hace DELETE a /trip-entries/100 sin body de respuesta', () => {
      let completed = false;
      service.deleteEntry(100).subscribe({ complete: () => (completed = true) });

      const req = http.expectOne(`${BASE}/trip-entries/100`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(completed).toBeTrue();
    });
  });

  // ── GET assets/countries.json (países) ───────────────────────────────

  describe('GET assets/countries.json (getPaises)', () => {
    it('carga el JSON local y devuelve los países', () => {
      const mockCountries: Country[] = [
        { name: { common: 'Alemania' }, ccn3: '276', region: 'Europe', latlng: [51, 10] },
        { name: { common: 'España' }, ccn3: '724', region: 'Europe', latlng: [40, -4] },
        { name: { common: 'Francia' }, ccn3: '250', region: 'Europe', latlng: [46, 2] },
      ];

      service.getPaises().subscribe(paises => {
        expect(paises.length).toBe(3);
        expect(paises[0].name.common).toBe('Alemania');
        expect(paises[0].latlng).toEqual([51, 10]);
        expect(paises[0].region).toBe('Europe');
      });

      const req = http.expectOne('assets/countries.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockCountries);
    });
  });
});
