import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ViajeCardComponent } from './viaje-card.component';

const mockViaje = {
  id: 1, id_user: 1, title: 'Francia',
  continent: 'Europa', image: '', tipo: 'realizado' as const,
};

describe('ViajeCardComponent', () => {
  let fixture: ComponentFixture<ViajeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViajeCardComponent);
    fixture.componentRef.setInput('viaje', mockViaje);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display trip title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Francia');
  });
});
