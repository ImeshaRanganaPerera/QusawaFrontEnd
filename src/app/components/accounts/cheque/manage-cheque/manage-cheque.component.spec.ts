import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChequeComponent } from './manage-cheque.component';

describe('ManageChequeComponent', () => {
  let component: ManageChequeComponent;
  let fixture: ComponentFixture<ManageChequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageChequeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
