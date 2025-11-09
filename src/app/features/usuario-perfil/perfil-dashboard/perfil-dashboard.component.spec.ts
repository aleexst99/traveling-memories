import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilDashboardComponent } from './perfil-dashboard.component';

describe('PerfilDashboardComponent', () => {
  let component: PerfilDashboardComponent;
  let fixture: ComponentFixture<PerfilDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
