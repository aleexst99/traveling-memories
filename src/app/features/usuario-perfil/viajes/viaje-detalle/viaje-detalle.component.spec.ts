import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajeDetalleComponent } from './viaje-detalle.component';

describe('ViajeDetalleComponent', () => {
  let component: ViajeDetalleComponent;
  let fixture: ComponentFixture<ViajeDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViajeDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
