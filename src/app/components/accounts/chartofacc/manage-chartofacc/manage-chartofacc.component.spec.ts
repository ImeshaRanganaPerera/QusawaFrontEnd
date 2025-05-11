import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChartofaccComponent } from './manage-chartofacc.component';

describe('ManageChartofaccComponent', () => {
  let component: ManageChartofaccComponent;
  let fixture: ComponentFixture<ManageChartofaccComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageChartofaccComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageChartofaccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
