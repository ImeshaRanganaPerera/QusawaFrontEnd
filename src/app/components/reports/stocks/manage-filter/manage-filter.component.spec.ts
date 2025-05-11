import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFilterComponent } from './manage-filter.component';

describe('ManageFilterComponent', () => {
  let component: ManageFilterComponent;
  let fixture: ComponentFixture<ManageFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
