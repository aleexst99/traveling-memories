import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    http.match('assets/countries.json').forEach(r => r.flush([]));
    http.match(r => r.url.includes('/countries')).forEach(r => r.flush([]));
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
