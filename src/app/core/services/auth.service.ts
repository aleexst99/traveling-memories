import { Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';

interface AuthUser {
  username: string;
  userId: number;
}

const USERS: { username: string; password: string; userId: number }[] = [
  { username: 'alejandro', password: 'alex2024', userId: 1 },
  { username: 'arturo',    password: 'artu2024', userId: 2 },
];

const STORAGE_KEY = 'tm_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(this.loadFromStorage());

  private loadFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  login(username: string, password: string): boolean {
    // Login provisional — se sustituirá por POST /auth/login cuando el backend lo exponga
    const match = USERS.find(u => u.username === username.toLowerCase() && u.password === password);
    if (!match) return false;
    const user: AuthUser = { username: match.username, userId: match.userId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    return true;
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
}
