import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGroupComponent } from './report-group.component';

describe('ReportGroupComponent', () => {
  let component: ReportGroupComponent;
  let fixture: ComponentFixture<ReportGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
