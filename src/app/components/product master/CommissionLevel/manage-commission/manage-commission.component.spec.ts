import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCommissionComponent } from './manage-commission.component';

describe('ManageCommissionComponent', () => {
  let component: ManageCommissionComponent;
  let fixture: ComponentFixture<ManageCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCommissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
