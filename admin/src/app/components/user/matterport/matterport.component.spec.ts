import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterportComponent } from './matterport.component';

describe('MatterportComponent', () => {
  let component: MatterportComponent;
  let fixture: ComponentFixture<MatterportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatterportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatterportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
