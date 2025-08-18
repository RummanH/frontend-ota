import { Component, inject, Sanitizer } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../layout/service/auth.service';
import { AllApiService } from '../../../layout/service/all-api.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import airlineLogos from "airlogos";

@Component({
  standalone: true,
  selector: 'app-recent-sales-widget',
  imports: [CommonModule, TableModule, ButtonModule, RippleModule],
  template: `<div class="card !mb-8">
    <div class="font-semibold text-xl mb-4">Recent Retrieved Tickets</div>
    <p-table [value]="ticketList" [rows]="5" responsiveLayout="scroll">
      <ng-template #header>
        <tr>
          <th style="min-width: 8rem">Airline</th>
          <th style="min-width: 10rem">Ref No</th>
          <th style="min-width: 12rem">Ticketing Date</th>
          <th style="min-width: 16rem">Departure Date</th>
          <th style="min-width: 8rem">Total Pax</th>
          <th style="min-width: 10rem">Airline PNR</th>
          <th style="min-width: 10rem">Sabre PNR</th>
          <th style="min-width: 10rem">Route</th>
          <th style="min-width: 10rem">Total Fare</th>
        </tr>
      </ng-template>

      <ng-template #body let-ticket>
        <tr>
          <td>
            <img [src]="getSafeUrl(airLogos[ticket.CarrierCode].png)" style="width: 64px" class="rounded" />
          </td>
          <td>{{ ticket.RefNo }}</td>
          <td>{{ ticket.TicketingDate | date: 'EEE, dd MMM yyyy' }}</td>
          <td>{{ ticket.DepartureDate | date: 'EEE, dd MMM yyyy, H:mm a' }}</td>
          <td>{{ ticket.TotalPax }}</td>
          <td>{{ ticket.ConfirmationNo }}</td>
          <td>{{ ticket.ReservationNo }}</td>
          <td [innerHTML]="ticket.Sector"></td>
          <td>{{ ticket.TotalFare }}</td>
        </tr>
      </ng-template>
    </p-table>
  </div>`,
  providers: [],
})
export class RecentSalesWidget {
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private allApi = inject(AllApiService);
  public imgUrl = '';
  public ticketList: any;
  airLogos;

  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }

  ngOnInit() {
    this.getData();
    this.airLogos = airlineLogos;
  }

  getData() {
    const payload = {
      FromDate: null,
      ToDate: null,
      BookingRef: '',
      PageNumber: 0,
      PageSize: 10,
      TicketType: 'TICKETING_CONFIRMED',
    };

    this.authService.getRetrievedTickets(payload).subscribe({
      next: (response: any) => {
        this.ticketList = response.Payload?.ConfirmReportData || [];
      },
      error: (err: any) => {
        console.error('Failed to retrieve tickets:', err);
        this.ticketList = [];
      },
    });
  }
}
