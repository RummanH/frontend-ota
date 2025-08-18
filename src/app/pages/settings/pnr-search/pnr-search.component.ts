import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple, RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { AuthService } from '../../../layout/service/auth.service';
import { Message } from 'primeng/message';
import { Checkbox } from 'primeng/checkbox';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-pnr-search',
    imports: [FormsModule, SelectModule, InputTextModule, FloatLabel, ButtonModule, ReactiveFormsModule, CommonModule, Toast, RippleModule, Message, Checkbox, Tooltip],
    templateUrl: './pnr-search.component.html',
    styleUrl: './pnr-search.component.scss',
    providers: [MessageService]
})
export class PnrSearchComponent implements OnInit {
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private router = inject(Router);
    private authService = inject(AuthService);

    public searchForm!: FormGroup;
    public formStatus: 'idle' | 'loading' | 'success' = 'idle';

    constructor() {}

    ngOnInit() {
        this.searchForm = this.fb.group({
            text: ['', Validators.required],
            includeReissue: [false]
        });
    }

    toUppercase() {
        const emailControl = this.searchForm.get('text');
        const uppercased = emailControl?.value?.toUpperCase() || '';
        if (emailControl?.value !== uppercased) {
            emailControl?.setValue(uppercased, { emitEvent: false });
        }
    }

    onSubmit() {
        if (this.searchForm.invalid) return;

        this.formStatus = 'loading';

        const query = this.searchForm.value.text?.trim()?.toUpperCase();
        const isReissueSearch = this.searchForm.value.includeReissue;

        this.authService.retrieveTicket(query, isReissueSearch).subscribe({
            next: (data: any) => {
                if (data?.Success && data?.Payload?.TicketingDetails && data?.Payload?.TravelDetials && data?.Payload?.Routes?.length && data?.Payload?.Paxlist?.length && data?.Payload?.FareBrakeDown && data?.Payload?.AgencyDetails) {
                    this.formStatus = 'success';
                    this.showMessage('success', 'Success', 'Ticket retrieved successfully!');
                    this.searchForm.reset();

                    console.log(data.Payload);

                    this.router.navigate(['/settings/ticket'], {
                        queryParams: {
                            pnr: query,
                            template: this.authService.user()?.TemplateId || 1,
                            mode: 'live',
                            ticketType: isReissueSearch ? 'Reissue' : ''
                        }
                    });

                    setTimeout(() => {
                        this.formStatus = 'idle';
                    }, 2000);
                } else {
                    this.formStatus = 'idle';
                    this.showMessage('error', 'Failed', data?.Message || 'Ticket not found.');
                }
            },
            error: (err) => {
                this.formStatus = 'idle';
                console.error('Error retrieving ticket:', err);
                this.showMessage('error', 'Error', 'An error occurred while retrieving the ticket.');
            }
        });
    }

    noSpaceValidator(control: AbstractControl): ValidationErrors | null {
        const hasSpace = (control.value || '').includes(' ');
        return hasSpace ? { noSpace: true } : null;
    }

    showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail });
    }

    viewTicket() {
        this.router.navigate(['/settings/ticket/' + '234567']);
    }

    viewInvoice() {
        this.router.navigate(['/invoice']);
    }
}
