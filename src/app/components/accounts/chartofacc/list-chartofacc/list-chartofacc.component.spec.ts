import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChartofaccComponent } from './list-chartofacc.component';

describe('ListChartofaccComponent', () => {
  let component: ListChartofaccComponent;
  let fixture: ComponentFixture<ListChartofaccComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListChartofaccComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListChartofaccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
