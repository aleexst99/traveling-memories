import { TestBed } from '@angular/core/testing';
import { ViajeEntradaComponent } from './viaje-entrada.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ViajeEntradaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeEntradaComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ViajeEntradaComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
