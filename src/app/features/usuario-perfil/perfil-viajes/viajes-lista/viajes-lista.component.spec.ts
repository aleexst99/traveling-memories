import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajesListaComponent } from './viajes-lista.component';

describe('ViajesListaComponent', () => {
  let component: ViajesListaComponent;
  let fixture: ComponentFixture<ViajesListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajesListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViajesListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
