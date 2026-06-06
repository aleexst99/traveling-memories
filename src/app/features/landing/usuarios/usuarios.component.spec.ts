import { TestBed } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UsuariosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UsuariosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
