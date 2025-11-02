import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilMapaComponent } from './perfil-mapa.component';

describe('PerfilMapaComponent', () => {
  let component: PerfilMapaComponent;
  let fixture: ComponentFixture<PerfilMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
