import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePettyCashComponent } from './manage-petty-cash.component';

describe('ManagePettyCashComponent', () => {
  let component: ManagePettyCashComponent;
  let fixture: ComponentFixture<ManagePettyCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePettyCashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePettyCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
