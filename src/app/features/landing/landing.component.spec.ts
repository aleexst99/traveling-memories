import { TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LandingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
