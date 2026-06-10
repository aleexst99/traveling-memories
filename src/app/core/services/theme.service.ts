import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'tm_modo_oscuro';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** true = dark (por defecto), false = light */
  readonly isDark = signal<boolean>(this.loadPreference());

  constructor() {
    // Aplica la clase en <html> cada vez que cambie el tema
    effect(() => {
      if (this.isDark()) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(STORAGE_KEY, String(this.isDark()));
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private loadPreference(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Si nunca se ha guardado preferencia, usamos dark como default
    return stored === null ? true : stored === 'true';
  }
}
