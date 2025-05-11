import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefVouchersComponent } from './ref-vouchers.component';

describe('RefVouchersComponent', () => {
  let component: RefVouchersComponent;
  let fixture: ComponentFixture<RefVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefVouchersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
