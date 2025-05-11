import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDiscountLevelComponent } from './list-discount-level.component';

describe('ListDiscountLevelComponent', () => {
  let component: ListDiscountLevelComponent;
  let fixture: ComponentFixture<ListDiscountLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDiscountLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDiscountLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
