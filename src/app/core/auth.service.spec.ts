import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  // ── Instancia ─────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no user logged in when localStorage is empty', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  // ── Login ─────────────────────────────────────────────────

  it('should login with valid credentials (alejandro)', () => {
    const result = service.login('alejandro', 'alex2024');
    expect(result).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.currentUser()?.username).toBe('alejandro');
    expect(service.currentUser()?.userId).toBe(1);
  });

  it('should login with valid credentials (arturo)', () => {
    const result = service.login('arturo', 'artu2024');
    expect(result).toBeTrue();
    expect(service.currentUser()?.userId).toBe(2);
  });

  it('should login case-insensitive (ALEJANDRO)', () => {
    const result = service.login('ALEJANDRO', 'alex2024');
    expect(result).toBeTrue();
  });

  it('should reject wrong password', () => {
    const result = service.login('alejandro', 'wrong');
    expect(result).toBeFalse();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should reject unknown user', () => {
    const result = service.login('unknown', 'alex2024');
    expect(result).toBeFalse();
  });

  it('should persist session in localStorage after login', () => {
    service.login('alejandro', 'alex2024');
    const stored = JSON.parse(localStorage.getItem('tm_auth_user')!);
    expect(stored.username).toBe('alejandro');
  });

  // ── Logout ────────────────────────────────────────────────

  it('should logout and clear state', () => {
    service.login('alejandro', 'alex2024');
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('tm_auth_user')).toBeNull();
  });

  // ── canEditUser ───────────────────────────────────────────

  it('should allow editing own profile', () => {
    service.login('alejandro', 'alex2024');
    expect(service.canEditUser(1)).toBeTrue();
  });

  it('should not allow editing another user profile', () => {
    service.login('alejandro', 'alex2024');
    expect(service.canEditUser(2)).toBeFalse();
  });

  it('should not allow editing when not logged in', () => {
    expect(service.canEditUser(1)).toBeFalse();
  });

  // ── Persistencia al recargar ──────────────────────────────

  it('should restore session from localStorage on init', () => {
    localStorage.setItem('tm_auth_user', JSON.stringify({ username: 'arturo', userId: 2 }));
    const freshService = new (AuthService as any)();
    expect(freshService.isLoggedIn()).toBeTrue();
    expect(freshService.currentUser()?.username).toBe('arturo');
  });
});
