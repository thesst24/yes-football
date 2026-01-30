import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCheck } from './card-check';

describe('CardCheck', () => {
  let component: CardCheck;
  let fixture: ComponentFixture<CardCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
