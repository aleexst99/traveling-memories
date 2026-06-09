import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { ApiUser, ApiTripOut, ApiTripEntryOut } from '@core/models/api.models';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Instancia ─────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── mapUser ───────────────────────────────────────────────

  it('should map ApiUser to User correctly', () => {
    const apiUser: ApiUser = {
      id: 1,
      name: 'Alejandro',
      avatar_url: 'https://example.com/photo.jpg',
      bio: 'Viajero apasionado',
    };
    const user = service.mapUser(apiUser);
    expect(user.id).toBe(1);
    expect(user.name).toBe('Alejandro');
    expect(user.photo).toBe('https://example.com/photo.jpg');
    expect(user.bio).toBe('Viajero apasionado');
    expect(user.trips).toEqual([]);
    expect(user.wishlist).toEqual([]);
  });

  it('should generate initials avatar when avatar_url is null', () => {
    const apiUser: ApiUser = { id: 1, name: 'Alejandro', avatar_url: undefined };
    const user = service.mapUser(apiUser);
    expect(user.photo).toContain('data:image/svg+xml;base64,');
  });

  it('should use empty string for bio when not provided', () => {
    const apiUser: ApiUser = { id: 1, name: 'Test' };
    const user = service.mapUser(apiUser);
    expect(user.bio).toBe('');
  });

  // ── mapTrip ───────────────────────────────────────────────

  it('should map ApiTripOut to Viaje correctly', () => {
    const apiTrip: ApiTripOut = {
      id: 10,
      title: 'Francia',
      user_id: 1,
      is_wishlist: false,
      cover_photo_url: 'https://example.com/france.jpg',
      summary: 'Un viaje increíble',
    };
    const viaje = service.mapTrip(apiTrip);
    expect(viaje.id).toBe(10);
    expect(viaje.title).toBe('Francia');
    expect(viaje.id_user).toBe(1);
    expect(viaje.tipo).toBe('realizado');
    expect(viaje.image).toBe('https://example.com/france.jpg');
    expect(viaje.description).toBe('Un viaje increíble');
  });

  it('should map is_wishlist true to tipo wishlist', () => {
    const apiTrip: ApiTripOut = {
      id: 1, title: 'Japón', user_id: 1, is_wishlist: true,
    };
    expect(service.mapTrip(apiTrip).tipo).toBe('wishlist');
  });

  it('should use empty string for image when cover_photo_url is missing', () => {
    const apiTrip: ApiTripOut = { id: 1, title: 'Test', user_id: 1, is_wishlist: false };
    expect(service.mapTrip(apiTrip).image).toBe('');
  });

  // ── mapEntry ──────────────────────────────────────────────

  it('should map ApiTripEntryOut to Entrada correctly', () => {
    const apiEntry: ApiTripEntryOut = {
      id: 100,
      trip_id: 10,
      title: 'París',
      content: 'Ciudad de la luz',
      entry_date: '2024-05-01',
    };
    const entrada = service.mapEntry(apiEntry);
    expect(entrada.id).toBe(100);
    expect(entrada.id_viaje).toBe(10);
    expect(entrada.title).toBe('París');
    expect(entrada.description).toBe('Ciudad de la luz');
    expect(entrada.fecha).toBe('2024-05-01');
  });

  // ── getUsers ──────────────────────────────────────────────

  it('should call GET /users and return mapped users', () => {
    const mockResponse = {
      response: [
        { id: 1, name: 'Alejandro', avatar_url: undefined, bio: 'Bio test' },
        { id: 2, name: 'Arturo', avatar_url: undefined, bio: '' },
      ]
    };

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('Alejandro');
      expect(users[1].name).toBe('Arturo');
    });

    const req = httpMock.expectOne(r => r.url.includes('/users'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ── getTrip ───────────────────────────────────────────────

  it('should call GET /trips/:id and return mapped viaje', () => {
    const mockTrip: ApiTripOut = {
      id: 5, title: 'Holanda', user_id: 1, is_wishlist: false,
    };

    service.getTrip(5).subscribe(viaje => {
      expect(viaje.id).toBe(5);
      expect(viaje.title).toBe('Holanda');
    });

    const req = httpMock.expectOne(r => r.url.includes('/trips/5'));
    expect(req.request.method).toBe('GET');
    req.flush(mockTrip);
  });

  // ── createTrip ────────────────────────────────────────────

  it('should call POST /trips with correct body', () => {
    const viaje = {
      id: 0, id_user: 1, title: 'Italia', continent: 'Europa',
      image: '', tipo: 'realizado' as const,
    };

    service.createTrip(viaje).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/trips'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Italia');
    expect(req.request.body.user_id).toBe(1);
    expect(req.request.body.is_wishlist).toBeFalse();
    req.flush({ ...req.request.body, id: 1 });
  });

  // ── createEntry ───────────────────────────────────────────

  it('should call POST /trip-entries with correct body', () => {
    const entrada = {
      id: 0, id_viaje: 5, title: 'Ámsterdam',
      fecha: '2024-06-01', description: 'Canales y tulipanes',
    };

    service.createEntry(entrada).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/trip-entries'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Ámsterdam');
    expect(req.request.body.trip_id).toBe(5);
    expect(req.request.body.content).toBe('Canales y tulipanes');
    expect(req.request.body.entry_date).toBe('2024-06-01');
    req.flush({ ...req.request.body, id: 100 });
  });
});
