import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageVouchersComponent } from './manage-vouchers.component';

describe('ManageVouchersComponent', () => {
  let component: ManageVouchersComponent;
  let fixture: ComponentFixture<ManageVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageVouchersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
