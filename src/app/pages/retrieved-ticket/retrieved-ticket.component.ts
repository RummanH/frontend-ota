import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProductService } from '../service/product.service';
import { PagedData, Pagination } from './pagination.model';
import { AuthService } from '../../layout/service/auth.service';
import { DatePicker } from 'primeng/datepicker';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AllApiService } from '../../layout/service/all-api.service';
import { EncrDecrService } from '../../layout/service/encr-decr.service';
import airlineLogos from 'airlogos';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

interface ITicket {
  bookingId: string;
  creationDate: string;
  confirmationNo: string;
  reservationNo: string;
  route: string;
  flightDate: string;
  totalPrice: number;
  extraServicePrice: number;
  status: string;
  airlineCode: string;
  noOfTotalPax: number;
  passengerName: string;
}

@Component({
  selector: 'app-retrieved-ticket',
  imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, RatingModule, InputTextModule, TextareaModule, SelectModule, RadioButtonModule, InputNumberModule, DialogModule, TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule, DatePicker],
  templateUrl: './retrieved-ticket.component.html',
  styleUrl: './retrieved-ticket.component.scss',
  providers: [MessageService, ProductService, ConfirmationService],
})
export class RetrievedTicketComponent {
  ticketList: any;
  private authService = inject(AuthService);
  cd = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private router = inject(Router);
  private allApi = inject(AllApiService);
  private encrDecr = inject(EncrDecrService);
  private sanitizer = inject(DomSanitizer);
  airLogos;

  pagination: Pagination = new Pagination();
  isFetchingData = false;

  onLazyLoad(event: TableLazyLoadEvent) {
    this.getData(this.setupPagination(event, this.pagination));
  }

  setupPagination(event: TableLazyLoadEvent, pagination: Pagination): Pagination {
    pagination = new Pagination({
      first: event.first,
      rows: event.rows || 0,
    });

    return pagination;
  }

  viewTicket(PNR: any) {
    this.authService.getTicketAfterRetrieve(PNR).subscribe({
      next: (data: any) => {
        if (data?.Success) {
          // this.formStatus = 'success';
          this.showMessage('success', 'Success', 'Ticket retrieved successfully!');
          // this.searchForm.reset();
          this.router.navigate(['/settings/ticket'], {
            queryParams: {
              pnr: PNR,
              template: this.authService.user()?.TemplateId || 1,
              mode: 'live',
            },
          });
        } else {
          this.showMessage('error', 'Failed', data?.message || 'Ticket not found.');
        }
      },
      error: (err) => {
        console.error('Error retrieving ticket:', err);
        this.showMessage('error', 'Error', 'An error occurred while retrieving the ticket.');
      },
    });
  }

  viewInvoice(ticket: any) {}

  getData(pagination?: Pagination) {
    this.pagination = pagination || new Pagination();
    // this.isFetchingData = true;

    const payload = {
      FromDate: this.apiDateToString(this.searchFilters.dateFrom),
      ToDate: this.apiDateToString(this.searchFilters.dateTo),
      // BookingRef: this.searchFilters.igxNumber,
      PageNumber: this.pagination.pageNumber ? this.pagination.pageNumber - 1 : 0,
      PageSize: this.pagination.pageSize,
      SearchValue: this.searchFilters.pnrNumber,
      TicketType: this.currentType === 'confirmed' ? 'TICKETING_CONFIRMED' : this.ticketType === 'void' ? 'Ticket_Void' : 'Ticket_Cancel',
    };

    this.authService.getRetrievedTickets(payload).subscribe({
      next: (response: any) => {
        this.ticketList = response.Payload?.ConfirmReportData;
        this.pagination.totalRecord = response.Payload.TotalItemCount;
        // this.pagination = new Pagination({
        //     pageNumber: this.pagination.pageNumber ? this.pagination.pageNumber - 1 : 0,
        //     pageSize: this.pagination.pageSize,
        //     totalRecord: response.Payload?.totalRecord || 0
        // });

        this.searchDialogVisible = false;
      },
      error: (error: any) => {
        this.isFetchingData = false;
        this.cd.detectChanges();
        console.error('Error loading tickets:', error);
      },
      complete: () => {
        this.isFetchingData = false;
      },
    });
  }

  searchDialogVisible = false;

  searchFilters = {
    pnrNumber: '',
    dateFrom: null,
    dateTo: null,
    igxNumber: '',
  };

  applyFilters() {
    const payload = {
      FromDate: this.apiDateToString(this.searchFilters.dateFrom),
      ToDate: this.apiDateToString(this.searchFilters.dateTo),
      // BookingRef: this.searchFilters.igxNumber,
      PageNumber: this.pagination.pageNumber ? this.pagination.pageNumber - 1 : 0,
      PageSize: this.pagination.pageSize || 10,
      SearchValue: this.searchFilters.pnrNumber,
      TicketType: this.currentType === 'confirmed' ? 'TICKETING_CONFIRMED' : this.ticketType === 'void' ? 'Ticket_Void' : 'Ticket_Cancel',
    };

    this.authService.getRetrievedTickets(payload).subscribe({
      next: (data: any) => {
        if (data.Success) {
          this.searchDialogVisible = false;
          this.ticketList = data.Payload?.ConfirmReportData;
          this.pagination.totalRecord = data.Payload.TotalItemCount;
        }
      },
      error: (error) => {
        console.error('Error fetching tickets:', error);
      },
    });
  }

  clearFilters() {
    this.searchFilters = {
      pnrNumber: '',
      dateFrom: null,
      dateTo: null,
      igxNumber: '',
    };

    // this.tenDaysAgo.setDate(this.today.getDate() - 30);
    // this.searchFilters.dateFrom = this.tenDaysAgo;
    // this.searchFilters.dateTo = this.today;
  }

  productDialog: boolean = false;

  products = signal<any[]>([]);

  product!: any;

  selectedProducts!: any[] | null;

  submitted: boolean = false;

  @ViewChild('dt') dt!: Table;

  exportColumns!: ExportColumn[];

  cols!: Column[];
  currentType = '';

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute,
  ) {}

  exportCSV() {
    this.dt.exportCSV();
  }

  today: Date = new Date();
  tenDaysAgo: Date = new Date();
  imgUrl: string = '';
  ticketType = '';
  permissions;
  isShowTab = false;
  isSubUser = false;

  ngOnInit() {
    this.airLogos = airlineLogos;
    if (localStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(localStorage.getItem('isSubUser'));
    } else if (sessionStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(sessionStorage.getItem('isSubUser'));
    } else {
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 500);
    }

    this.route.queryParams.subscribe((params) => {
      this.currentType = params['type'];
      console.log(this.currentType);
      this.getData(this.pagination);
    });

    if (!this.isSubUser) {
      this.isShowTab = true;
    } else {
      this.authService.getPermission().subscribe((res: any) => {
        if (res.Success && this.isSubUser) {
          this.permissions = res.Payload;
          if (this.permissions?.length) {
            if (this.permissions[1].HasPermission) {
              this.isShowTab = true;
            }
          }
        }
      });
    }
  }

  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }

  openFiltering() {
    this.searchDialogVisible = true;
  }

  apiDateToString(apiDate: string | Date): any {
    if (apiDate) {
      const date = new Date(apiDate);
      const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      return dateString;
    }
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  showTicketStatusModal = false;
  selectedPnr = '';
  openTicketStatusModal(pnr: string) {
    this.selectedPnr = pnr;
    this.showTicketStatusModal = true;
  }

  selectedStatus: string = 'finished';

  statuses = [
    { label: 'Ticket Void', value: 'Ticket_Void' },
    { label: 'Ticket Cancel', value: 'Ticket_Cancel' },
  ];

  onStatusChange() {
    this.showTicketStatusModal = false;
  }

  submitTicketStatus() {
    const model = {
      PNR: this.selectedPnr,
      Status: this.selectedStatus,
    };

    this.authService.editTicketStatus(model).subscribe((res: any) => {
      if (res.Success) {
        this.showMessage('success', 'Ticket Status Updated', res.Message || 'Ticket Status Updated Successfully!');
        this.showTicketStatusModal = false;
      }
    });
  }
}
