import { TestBed } from '@angular/core/testing';
import { TripStoreService } from './trip-store.service';
import { Viaje, Entrada } from '../features/usuario-perfil/viajes/models/viajes.model';

const mockViaje: Viaje = {
  id: 1,
  id_user: 1,
  title: 'Francia',
  continent: 'Europa',
  image: '',
  tipo: 'realizado',
  lat: 46.2276,
  lng: 2.2137,
};

const mockEntrada: Entrada = {
  id: 100,
  id_viaje: 1,
  title: 'París',
  fecha: '2024-05-01',
  dias: 3,
  description: 'Ciudad de la luz',
};

describe('TripStoreService', () => {
  let service: TripStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripStoreService);
  });

  // ── Instancia ─────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', () => {
    expect(service.getTripsByUser(1)).toEqual([]);
    expect(service.getEntriesByTrip(1)).toEqual([]);
  });

  // ── Viajes ────────────────────────────────────────────────

  it('should add a trip', () => {
    service.addOrUpdateTrip(mockViaje);
    expect(service.getTripsByUser(1).length).toBe(1);
    expect(service.getTripsByUser(1)[0].title).toBe('Francia');
  });

  it('should update an existing trip', () => {
    service.addOrUpdateTrip(mockViaje);
    service.addOrUpdateTrip({ ...mockViaje, title: 'Francia Actualizada' });
    const trips = service.getTripsByUser(1);
    expect(trips.length).toBe(1);
    expect(trips[0].title).toBe('Francia Actualizada');
  });

  it('should get trip by id', () => {
    service.addOrUpdateTrip(mockViaje);
    const found = service.getTrip(1);
    expect(found).toBeTruthy();
    expect(found?.title).toBe('Francia');
  });

  it('should return undefined for non-existent trip', () => {
    expect(service.getTrip(999)).toBeUndefined();
  });

  it('should filter trips by user', () => {
    service.addOrUpdateTrip(mockViaje);
    service.addOrUpdateTrip({ ...mockViaje, id: 2, id_user: 2, title: 'Japón' });
    expect(service.getTripsByUser(1).length).toBe(1);
    expect(service.getTripsByUser(2).length).toBe(1);
    expect(service.getTripsByUser(1)[0].title).toBe('Francia');
  });

  it('should remove a trip', () => {
    service.addOrUpdateTrip(mockViaje);
    service.removeTrip(1);
    expect(service.getTripsByUser(1)).toEqual([]);
  });

  // ── Entradas ──────────────────────────────────────────────

  it('should add an entry', () => {
    service.addOrUpdateEntry(mockEntrada);
    expect(service.getEntriesByTrip(1).length).toBe(1);
    expect(service.getEntriesByTrip(1)[0].title).toBe('París');
  });

  it('should update an existing entry', () => {
    service.addOrUpdateEntry(mockEntrada);
    service.addOrUpdateEntry({ ...mockEntrada, title: 'París Actualizado' });
    const entries = service.getEntriesByTrip(1);
    expect(entries.length).toBe(1);
    expect(entries[0].title).toBe('París Actualizado');
  });

  it('should filter entries by trip', () => {
    service.addOrUpdateEntry(mockEntrada);
    service.addOrUpdateEntry({ ...mockEntrada, id: 101, id_viaje: 2, title: 'Lyon' });
    expect(service.getEntriesByTrip(1).length).toBe(1);
    expect(service.getEntriesByTrip(2).length).toBe(1);
  });

  it('should remove an entry', () => {
    service.addOrUpdateEntry(mockEntrada);
    service.removeEntry(100);
    expect(service.getEntriesByTrip(1)).toEqual([]);
  });

  it('should return empty array for entries of non-existent trip', () => {
    expect(service.getEntriesByTrip(999)).toEqual([]);
  });
});
