import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIouComponent } from './update-iou.component';

describe('UpdateIouComponent', () => {
  let component: UpdateIouComponent;
  let fixture: ComponentFixture<UpdateIouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateIouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateIouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
