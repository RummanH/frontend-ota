import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-ticket',
  imports: [],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class TicketComponent implements OnInit {
  ngOnInit(): void {}
}
