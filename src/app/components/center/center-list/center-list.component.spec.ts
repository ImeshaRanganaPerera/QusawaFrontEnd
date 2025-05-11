import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterListComponent } from './center-list.component';

describe('CenterListComponent', () => {
  let component: CenterListComponent;
  let fixture: ComponentFixture<CenterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
