import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaGlobalComponent } from './mapa-global.component';

describe('MapaGlobalComponent', () => {
  let component: MapaGlobalComponent;
  let fixture: ComponentFixture<MapaGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
