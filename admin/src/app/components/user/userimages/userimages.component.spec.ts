import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserimagesComponent } from './userimages.component';

describe('UserimagesComponent', () => {
  let component: UserimagesComponent;
  let fixture: ComponentFixture<UserimagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserimagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserimagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
