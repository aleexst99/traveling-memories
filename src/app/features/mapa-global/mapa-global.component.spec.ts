import { TestBed } from '@angular/core/testing';
import { MapaGlobalComponent } from './mapa-global.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('MapaGlobalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaGlobalComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MapaGlobalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
