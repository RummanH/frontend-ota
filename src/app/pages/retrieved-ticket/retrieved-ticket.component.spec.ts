import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrievedTicketComponent } from './retrieved-ticket.component';

describe('RetrievedTicketComponent', () => {
  let component: RetrievedTicketComponent;
  let fixture: ComponentFixture<RetrievedTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetrievedTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetrievedTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
