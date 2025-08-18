import { Component, effect, inject, Input } from '@angular/core';
import { TicketService } from '../../../../../layout/service/ticket.service';
import { CommonModule } from '@angular/common';
import { AirportNameToCountryPipe } from '../../../../../common/pipes/airport-name-to-country.pipe';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import airlineLogos from 'airlogos';

@Component({
  selector: 'app-ticket-one',
  imports: [CommonModule, AirportNameToCountryPipe],
  templateUrl: './ticket-one.component.html',
  styleUrl: './ticket-one.component.scss',
})
export class TicketOneComponent {
  ticketService = inject(TicketService);
  private sanitizer = inject(DomSanitizer);
  airLogos;

  constructor() {
    effect(() => {
      const ticket = this.ticketService.ticketData();
      console.log(ticket);
    });
  }

  ngOnInit(): void {
    this.airLogos = airlineLogos;
  }

  @Input() isShowFare!: boolean;

  getUniqueBaggageInfos(baggageInfos: any[]) {
    const uniqueMap = new Map();
    baggageInfos?.forEach((info) => {
      if (info?.Baggage && !uniqueMap.has(info.Baggage)) {
        uniqueMap.set(info.Baggage, info);
      }
    });
    return Array.from(uniqueMap.values());
  }

  combinedSegments(ticketData): any[] {
    return [...(ticketData?.TravelDetials?.OnwardSegmentList || []), ...(ticketData?.TravelDetials?.ReturnSegmentList || [])];
  }

  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }
}
