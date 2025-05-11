import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBankRecComponent } from './manage-bank-rec.component';

describe('ManageBankRecComponent', () => {
  let component: ManageBankRecComponent;
  let fixture: ComponentFixture<ManageBankRecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBankRecComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBankRecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
