import { TestBed } from '@angular/core/testing';

import { ViajesService } from './viaje.service';

describe('ViajeServiceService', () => {
  let service: ViajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViajesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
