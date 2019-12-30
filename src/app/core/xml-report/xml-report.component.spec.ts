import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlReportComponent } from './xml-report.component';

describe('XmlReportComponent', () => {
  let component: XmlReportComponent;
  let fixture: ComponentFixture<XmlReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XmlReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XmlReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
