import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PerfilMapaComponent } from './perfil-mapa.component';

const mockUser = {
  id: 1, name: 'Alejandro', photo: '', bio: '',
  social: { github: '', linkedin: '' }, trips: [], wishlist: [],
};

describe('PerfilMapaComponent', () => {
  let fixture: ComponentFixture<PerfilMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilMapaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilMapaComponent);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
