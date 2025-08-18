import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketThreeComponent } from './ticket-three.component';

describe('TicketThreeComponent', () => {
  let component: TicketThreeComponent;
  let fixture: ComponentFixture<TicketThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketThreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
