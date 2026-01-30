import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCheckin } from './card-checkin';

describe('CardCheckin', () => {
  let component: CardCheckin;
  let fixture: ComponentFixture<CardCheckin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCheckin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCheckin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
