import { Injectable, signal, inject } from '@angular/core';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

interface AuthUser {
  username: string;
  userId:   number;
  token:    string;
}

const STORAGE_KEY = 'tm_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  currentUser = signal<AuthUser | null>(this.loadFromStorage());

  private loadFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /** Decodes the JWT payload (no verification — trust the backend) */
  private decodeToken(token: string): { sub: string; exp: number } | null {
    try {
      const payload = token.split('.')[1];
      const padded  = payload + '='.repeat((4 - payload.length % 4) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.api.login(username, password).pipe(
      tap(({ access_token }) => {
        const decoded = this.decodeToken(access_token);
        if (!decoded) return;
        const user: AuthUser = {
          username,
          userId: parseInt(decoded.sub, 10),
          token:  access_token,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /** Sets session after external auth (e.g. register flow) */
  setUser(user: { username: string; userId: number; token?: string }): void {
    const stored: AuthUser = { username: user.username, userId: user.userId, token: user.token ?? '' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    this.currentUser.set(stored);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  canEditUser(userId: number): boolean {
    return this.currentUser()?.userId === userId;
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }
}
