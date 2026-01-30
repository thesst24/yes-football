import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventUser } from './event-user';

describe('EventUser', () => {
  let component: EventUser;
  let fixture: ComponentFixture<EventUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
