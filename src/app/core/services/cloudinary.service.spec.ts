import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService — avatarUrl', () => {
  let service: CloudinaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CloudinaryService);
  });

  it('devuelve el fallback cuando la URL es null', () => {
    expect(service.avatarUrl(null)).toContain('default-avatar.svg');
  });

  it('devuelve el fallback cuando la URL es undefined', () => {
    expect(service.avatarUrl(undefined)).toContain('default-avatar.svg');
  });

  it('devuelve el fallback cuando la URL es una cadena vacía', () => {
    expect(service.avatarUrl('')).toContain('default-avatar.svg');
  });

  it('inserta las transformaciones en una URL limpia', () => {
    const original = 'https://res.cloudinary.com/demo/image/upload/v1234/avatar.jpg';
    const result   = service.avatarUrl(original, 280);

    expect(result).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_280,h_280,q_90,f_auto/v1234/avatar.jpg'
    );
  });

  it('elimina transformaciones previas (q_auto/f_auto) y aplica las nuestras', () => {
    const withExisting = 'https://res.cloudinary.com/demo/image/upload/q_auto/f_auto/v1781090243/alex.png';
    const result       = service.avatarUrl(withExisting, 280);

    expect(result).toBe(
      'https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_280,h_280,q_90,f_auto/v1781090243/alex.png'
    );
  });

  it('respeta el tamaño personalizado', () => {
    const original = 'https://res.cloudinary.com/demo/image/upload/v1234/avatar.jpg';
    const result   = service.avatarUrl(original, 100);

    expect(result).toContain('w_100,h_100');
  });

  it('no modifica URLs que no son de Cloudinary', () => {
    const external = 'https://example.com/photo.jpg';
    expect(service.avatarUrl(external)).toBe(external);
  });

  it('no duplica c_fill si la URL ya tiene nuestras transformaciones', () => {
    const already = 'https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_280,h_280,q_90,f_auto/v1234/avatar.jpg';
    const result  = service.avatarUrl(already, 280);

    const count = (result.match(/c_fill/g) || []).length;
    expect(count).toBe(1);
  });
});
