import { TestBed } from '@angular/core/testing';
import { UsuarioPerfilComponent } from './usuario-perfil.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UsuarioPerfilComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioPerfilComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UsuarioPerfilComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
