import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { PerfilHeaderComponent } from './perfil-header.component';

const mockUser = {
  id: 1, name: 'Alejandro', photo: 'assets/alex.png',
  bio: 'Test bio', social: { github: '', linkedin: '' },
  trips: [], wishlist: [],
};

describe('PerfilHeaderComponent', () => {
  let fixture: ComponentFixture<PerfilHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilHeaderComponent);
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display username in uppercase', () => {
    expect(fixture.componentInstance.displayName()).toBe('ALEJANDRO');
  });
});
