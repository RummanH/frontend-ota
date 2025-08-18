import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTwoComponent } from './ticket-two.component';

describe('TicketTwoComponent', () => {
  let component: TicketTwoComponent;
  let fixture: ComponentFixture<TicketTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
