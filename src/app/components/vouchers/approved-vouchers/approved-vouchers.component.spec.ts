import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedVouchersComponent } from './approved-vouchers.component';

describe('ApprovedVouchersComponent', () => {
  let component: ApprovedVouchersComponent;
  let fixture: ComponentFixture<ApprovedVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedVouchersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
