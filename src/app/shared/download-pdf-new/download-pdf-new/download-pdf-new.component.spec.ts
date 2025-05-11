import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPdfNewComponent } from './download-pdf-new.component';

describe('DownloadPdfNewComponent', () => {
  let component: DownloadPdfNewComponent;
  let fixture: ComponentFixture<DownloadPdfNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadPdfNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadPdfNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
