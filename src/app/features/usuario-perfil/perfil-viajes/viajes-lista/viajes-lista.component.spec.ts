import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ViajesListaComponentDos } from './viajes-lista.component';

describe('ViajesListaComponentDos', () => {
  let component: ViajesListaComponentDos;
  let fixture: ComponentFixture<ViajesListaComponentDos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajesListaComponentDos, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ViajesListaComponentDos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty viajes', () => {
    expect(component.viajes()).toEqual([]);
  });

  it('should start with empty wishlist', () => {
    expect(component.wishlist()).toEqual([]);
  });
});
