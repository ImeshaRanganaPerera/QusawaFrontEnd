import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportclearingComponent } from './importclearing.component';

describe('ImportclearingComponent', () => {
  let component: ImportclearingComponent;
  let fixture: ComponentFixture<ImportclearingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportclearingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportclearingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
