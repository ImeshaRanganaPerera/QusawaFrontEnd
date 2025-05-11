import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCommissionlevelComponent } from './list-commissionlevel.component';

describe('ListCommissionlevelComponent', () => {
  let component: ListCommissionlevelComponent;
  let fixture: ComponentFixture<ListCommissionlevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCommissionlevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCommissionlevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
