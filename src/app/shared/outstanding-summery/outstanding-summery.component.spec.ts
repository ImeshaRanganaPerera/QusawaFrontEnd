import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingSummeryComponent } from './outstanding-summery.component';

describe('OutstandingSummeryComponent', () => {
  let component: OutstandingSummeryComponent;
  let fixture: ComponentFixture<OutstandingSummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutstandingSummeryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutstandingSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
