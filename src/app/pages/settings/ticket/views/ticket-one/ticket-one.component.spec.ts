import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketOneComponent } from './ticket-one.component';

describe('TicketOneComponent', () => {
  let component: TicketOneComponent;
  let fixture: ComponentFixture<TicketOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
