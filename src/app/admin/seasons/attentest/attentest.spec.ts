import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attentest } from './attentest';

describe('Attentest', () => {
  let component: Attentest;
  let fixture: ComponentFixture<Attentest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attentest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Attentest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
