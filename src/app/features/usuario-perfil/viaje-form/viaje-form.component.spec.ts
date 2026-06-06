import { TestBed } from '@angular/core/testing';
import { ViajeFormComponent } from './viaje-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ViajeFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajeFormComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ViajeFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
