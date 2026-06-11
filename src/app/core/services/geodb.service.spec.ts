import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeoDbService } from './geodb.service';

describe('GeoDbService', () => {
  let service: GeoDbService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(GeoDbService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('devuelve array vacío si el prefijo tiene menos de 2 caracteres', (done) => {
    service.searchCities('M').subscribe(cities => {
      expect(cities).toEqual([]);
      done();
    });
    http.expectNone(() => true);
  });

  it('devuelve array vacío si el prefijo está vacío', (done) => {
    service.searchCities('').subscribe(cities => {
      expect(cities).toEqual([]);
      done();
    });
    http.expectNone(() => true);
  });

  it('llama al endpoint correcto con namePrefix y tipo CITY', () => {
    service.searchCities('Mad').subscribe();

    const req = http.expectOne(r =>
      r.url.includes('/v1/geo/cities') &&
      r.params.get('namePrefix') === 'Mad' &&
      r.params.get('types') === 'CITY'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });

  it('mapea correctamente la respuesta de la API', (done) => {
    service.searchCities('Madrid').subscribe(cities => {
      expect(cities.length).toBe(1);
      expect(cities[0].name).toBe('Madrid');
      expect(cities[0].country).toBe('Spain');
      expect(cities[0].latitude).toBe(40.4);
      done();
    });

    http.expectOne(r => r.url.includes('/v1/geo/cities')).flush({
      data: [{
        id: 1, name: 'Madrid', city: 'Madrid',
        country: 'Spain', countryCode: 'ES',
        latitude: 40.4, longitude: -3.7, type: 'CITY',
      }]
    });
  });

  it('devuelve array vacío si la API falla', (done) => {
    service.searchCities('Madrid').subscribe(cities => {
      expect(cities).toEqual([]);
      done();
    });

    http.expectOne(r => r.url.includes('/v1/geo/cities'))
      .flush('Error', { status: 429, statusText: 'Too Many Requests' });
  });
});
