import { Component, effect, inject, Input } from '@angular/core';
import { TicketService } from '../../../../../common/services/ticket.service';
import { CommonModule } from '@angular/common';
import { AirportNameToCountryPipe } from '../../../../../common/pipes/airport';
import airlineLogos from 'airlogos';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ticket-three',
  imports: [CommonModule, AirportNameToCountryPipe],
  templateUrl: './ticket-three.component.html',
  styleUrl: './ticket-three.component.scss',
})
export class TicketThreeComponent {
  ticketService = inject(TicketService);
  private sanitizer = inject(DomSanitizer);
  airLogos;
  constructor() {
    effect(() => {
      const ticket = this.ticketService.ticketData();
      console.log(ticket);
    });
  }

  @Input() isShowFare!: boolean;

  ngOnInit(): void {
    this.airLogos = airlineLogos;
  }

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
