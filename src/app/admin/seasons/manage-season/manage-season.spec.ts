import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSeason } from './manage-season';

describe('ManageSeason', () => {
  let component: ManageSeason;
  let fixture: ComponentFixture<ManageSeason>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSeason]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSeason);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
