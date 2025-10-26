import { TestBed } from '@angular/core/testing';

import { ViajeServiceService } from './viaje-service.service';

describe('ViajeServiceService', () => {
  let service: ViajeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViajeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
