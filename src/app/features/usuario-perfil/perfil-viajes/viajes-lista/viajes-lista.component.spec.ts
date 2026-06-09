import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ViajesListaComponent } from './viajes-lista.component';

describe('ViajesListaComponent', () => {
  let component: ViajesListaComponent;
  let fixture: ComponentFixture<ViajesListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajesListaComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ViajesListaComponent);
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
