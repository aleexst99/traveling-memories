import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajeCardComponent } from './viaje-card.component';

describe('ViajeCardComponent', () => {
  let component: ViajeCardComponent;
  let fixture: ComponentFixture<ViajeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViajeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
