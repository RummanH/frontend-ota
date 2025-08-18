import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../layout/service/auth.service';
import { Router } from '@angular/router';
import { PreloaderService } from '../../../layout/service/preloader.service';

@Component({
    selector: 'app-ticket-templates',
    imports: [CardModule, ButtonModule, ConfirmDialog, ToastModule, CommonModule],
    templateUrl: './ticket-templates.component.html',
    styleUrl: './ticket-templates.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class TicketTemplatesComponent {
    private confirmationService = inject(ConfirmationService);
    private preloaderService = inject(PreloaderService);
    private messageService = inject(MessageService);
    private authService = inject(AuthService);
    private router = inject(Router);
    selectedThemeId = 0;

    constructor() {
        effect(() => {
            const user = this.authService.user();
            if (user) {
                this.selectedThemeId = user.TemplateId;
            }
        });
    }

    livePreview(templateId: number) {
        this.preloaderService.showSpinner();
        this.router.navigate(['/settings/ticket'], {
            queryParams: {
                pnr: 'HDKSHGF',
                template: templateId,
                mode: 'preview'
            }
        });
    }

    chooseTemplate(templateId: number) {
        // Example: Select template logic
        console.log(`Template ${templateId} chosen`);
    }

    applyTheme(event: Event, id: number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Save'
            },

            accept: () => this.onSubmit(id)
        });
    }

    showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail });
    }

    themes = [
        {
            id: 1,
            title: 'Template 1',
            image: 'assets/img/ticket1.png'
        },
        {
            id: 2,
            title: 'Template 2',
            image: 'assets/img/ticket2.png'
        },

        {
            id: 3,
            title: 'Template 3',
            image: 'assets/img/ticket3.png'
        }
    ];

    formStatus: 'idle' | 'loading' | 'success' = 'idle';
    templateId = '';
    onSubmit(id: any) {
        this.formStatus = 'loading';
        const formData = new FormData();

        // Append simple fields
        formData.append('TemplateId', id);

        this.authService.editProfile(formData).subscribe({
            next: (response: any) => {
                debugger;
                if (response.Success) {
                    this.formStatus = 'success';
                    this.authService.loadUserFromServer();
                    this.authService.loadUserPermissions();
                    this.showMessage('info', 'Success', 'The ticket theme has been applied successfully.');
                } else {
                    this.formStatus = 'idle';
                    this.showMessage('error', 'Theme Application Failed', response.Message || 'The theme could not be applied. Please try again.');
                }
            },
            error: (err) => {
                this.formStatus = 'idle';
                console.error('HTTP Error:', err);
                this.showMessage('error', 'Theme Application Failed', 'The theme could not be applied. Please try again.');
            }
        });
    }
}
