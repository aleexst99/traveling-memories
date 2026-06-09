import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  // ── Instancia ─────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  // ── show ──────────────────────────────────────────────────

  it('should add a toast', () => {
    service.show('Mensaje de prueba', 'info');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Mensaje de prueba');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should add multiple toasts', () => {
    service.show('Primero', 'info');
    service.show('Segundo', 'success');
    expect(service.toasts().length).toBe(2);
  });

  it('should assign unique ids to toasts', () => {
    service.show('A', 'info');
    service.show('B', 'info');
    const ids = service.toasts().map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  // ── Helpers ───────────────────────────────────────────────

  it('success() should add a success toast', () => {
    service.success('OK');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('error() should add an error toast', () => {
    service.error('Error');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('info() should add an info toast', () => {
    service.info('Info');
    expect(service.toasts()[0].type).toBe('info');
  });

  // ── remove ────────────────────────────────────────────────

  it('should remove a toast by id', () => {
    service.show('A', 'info');
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts()).toEqual([]);
  });

  it('should only remove the specified toast', () => {
    service.show('A', 'info');
    service.show('B', 'success');
    const idA = service.toasts()[0].id;
    service.remove(idA);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('B');
  });

  // ── Auto-cierre ───────────────────────────────────────────

  it('should auto-remove toast after duration', fakeAsync(() => {
    service.show('Auto', 'info', 3000);
    expect(service.toasts().length).toBe(1);
    tick(3000);
    expect(service.toasts().length).toBe(0);
  }));

  it('should not remove toast before duration expires', fakeAsync(() => {
    service.show('Auto', 'info', 3000);
    tick(2999);
    expect(service.toasts().length).toBe(1);
    tick(1);
    expect(service.toasts().length).toBe(0);
  }));
});
