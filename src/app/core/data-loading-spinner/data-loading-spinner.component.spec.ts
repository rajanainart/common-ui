import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLoadingSpinnerComponent } from './data-loading-spinner.component';

describe('DataLoadingSpinnerComponent', () => {
  let component: DataLoadingSpinnerComponent;
  let fixture: ComponentFixture<DataLoadingSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataLoadingSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
