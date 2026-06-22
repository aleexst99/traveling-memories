import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

// JWT with payload { sub: "1", exp: 9999999999 }
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    http    = TestBed.inject(HttpTestingController);
    // ApiService constructor preloads countries — flush both
    http.expectOne('assets/countries.json').flush([]);
    http.match(r => r.url.includes('/countries')).forEach(r => r.flush([]));
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ── Instance ──────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no user when localStorage is empty', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  // ── Login ─────────────────────────────────────────────────

  it('should login successfully and store user + token', (done) => {
    service.login('sica', 'Sica1998').subscribe(ok => {
      expect(ok).toBeTrue();
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.currentUser()?.username).toBe('sica');
      expect(service.currentUser()?.userId).toBe(1);
      expect(service.getToken()).toBe(MOCK_TOKEN);
      done();
    });

    http.expectOne(r => r.url.includes('/auth/login'))
      .flush({ access_token: MOCK_TOKEN, token_type: 'bearer' });
  });

  it('should persist session in localStorage after login', (done) => {
    service.login('sica', 'Sica1998').subscribe(() => {
      const stored = JSON.parse(localStorage.getItem('tm_auth_user')!);
      expect(stored.username).toBe('sica');
      expect(stored.userId).toBe(1);
      expect(stored.token).toBe(MOCK_TOKEN);
      done();
    });

    http.expectOne(r => r.url.includes('/auth/login'))
      .flush({ access_token: MOCK_TOKEN, token_type: 'bearer' });
  });

  it('should return false and not set user on invalid credentials', (done) => {
    service.login('wrong', 'wrong').subscribe(ok => {
      expect(ok).toBeFalse();
      expect(service.isLoggedIn()).toBeFalse();
      done();
    });

    http.expectOne(r => r.url.includes('/auth/login'))
      .flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });

  // ── Logout ────────────────────────────────────────────────

  it('should logout and clear state', (done) => {
    service.login('sica', 'Sica1998').subscribe(() => {
      service.logout();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('tm_auth_user')).toBeNull();
      done();
    });

    http.expectOne(r => r.url.includes('/auth/login'))
      .flush({ access_token: MOCK_TOKEN, token_type: 'bearer' });
  });

  // ── canEditUser ───────────────────────────────────────────

  it('should allow editing own profile', (done) => {
    service.login('sica', 'Sica1998').subscribe(() => {
      expect(service.canEditUser(1)).toBeTrue();
      done();
    });

    http.expectOne(r => r.url.includes('/auth/login'))
      .flush({ access_token: MOCK_TOKEN, token_type: 'bearer' });
  });

  it('should not allow editing another user profile', (done) => {
    service.login('sica', 'Sica1998').subscribe(() => {
      expect(service.canEditUser(99)).toBeFalse();
      done();
    });

    http.expectOne(r => r.url.includes('/auth/login'))
      .flush({ access_token: MOCK_TOKEN, token_type: 'bearer' });
  });

  it('should not allow editing when not logged in', () => {
    expect(service.canEditUser(1)).toBeFalse();
  });

  // ── Restore session from localStorage ────────────────────

  it('should restore session from localStorage on init', () => {
    localStorage.setItem('tm_auth_user', JSON.stringify({
      username: 'sica', userId: 4, token: MOCK_TOKEN,
    }));
    // Re-create the service inside the injection context
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const fresh = TestBed.inject(AuthService);
    const freshHttp = TestBed.inject(HttpTestingController);
    freshHttp.expectOne('assets/countries.json').flush([]);
    freshHttp.match(r => r.url.includes('/countries')).forEach(r => r.flush([]));

    expect(fresh.isLoggedIn()).toBeTrue();
    expect(fresh.currentUser()?.username).toBe('sica');
    expect(fresh.getToken()).toBe(MOCK_TOKEN);
    freshHttp.verify();
  });
});
