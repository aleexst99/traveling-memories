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

  it('inserta q_90,f_auto en una URL limpia de Cloudinary', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1234/avatar.jpg';
    expect(service.avatarUrl(url)).toBe(
      'https://res.cloudinary.com/demo/image/upload/q_90,f_auto/v1234/avatar.jpg'
    );
  });

  it('no modifica URLs que no son de Cloudinary', () => {
    const external = 'https://example.com/photo.jpg';
    expect(service.avatarUrl(external)).toBe(external);
  });
});
