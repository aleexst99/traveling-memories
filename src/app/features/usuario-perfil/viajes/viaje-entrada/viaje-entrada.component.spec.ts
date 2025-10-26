import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajeEntradaComponent } from './viaje-entrada.component';

describe('ViajeEntradaComponent', () => {
  let component: ViajeEntradaComponent;
  let fixture: ComponentFixture<ViajeEntradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeEntradaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViajeEntradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
