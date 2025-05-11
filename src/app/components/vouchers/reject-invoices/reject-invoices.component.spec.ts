import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectInvoicesComponent } from './reject-invoices.component';

describe('RejectInvoicesComponent', () => {
  let component: RejectInvoicesComponent;
  let fixture: ComponentFixture<RejectInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
