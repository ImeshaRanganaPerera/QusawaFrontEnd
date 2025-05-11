import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingVouchersComponent } from './pending-vouchers.component';

describe('PendingVouchersComponent', () => {
  let component: PendingVouchersComponent;
  let fixture: ComponentFixture<PendingVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingVouchersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
