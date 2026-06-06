import { TestBed } from '@angular/core/testing';
import { ViajeDetalleComponent } from './viaje-detalle.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ViajeDetalleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeDetalleComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ViajeDetalleComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
