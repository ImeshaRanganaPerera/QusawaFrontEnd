import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSelectionComponent } from './transaction-selection.component';

describe('TransactionSelectionComponent', () => {
  let component: TransactionSelectionComponent;
  let fixture: ComponentFixture<TransactionSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
