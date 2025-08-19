import { Component, effect, inject, Input } from '@angular/core';
import { TicketService } from '../../../../../common/services/ticket.service';
import { CommonModule } from '@angular/common';
import { AirportNameToCountryPipe } from '../../../../../common/pipes/airport';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import airlineLogos from 'airlogos';

@Component({
  selector: 'app-ticket-two',
  imports: [CommonModule, AirportNameToCountryPipe],
  templateUrl: './ticket-two.component.html',
  styleUrl: './ticket-two.component.scss',
})
export class TicketTwoComponent {
  ticketService = inject(TicketService);
  private sanitizer = inject(DomSanitizer);
  airLogos

  constructor() {
    effect(() => {
      const ticket = this.ticketService.ticketData();
      console.log('🎫 Ticket updated:', ticket);
    });
  }

    ngOnInit(): void {
      this.airLogos = airlineLogos;
    }

  @Input() isShowFare!: boolean;

  getLastVisible(): string {
    const d = this.ticketService.ticketData();
    if (d.IsSeatIncluded) return 'Seat';
    if (d.IsMealIncluded) return 'Meal';
    if (d.IsBaggageIncluded) return 'Baggage';
    if (d.IsWheelchairIncluded) return 'Wheelchair';
    return 'ETicket';
  }

  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }
}
