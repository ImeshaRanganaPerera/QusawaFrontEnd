import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPettyCashComponent } from './list-petty-cash.component';

describe('ListPettyCashComponent', () => {
  let component: ListPettyCashComponent;
  let fixture: ComponentFixture<ListPettyCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPettyCashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPettyCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
