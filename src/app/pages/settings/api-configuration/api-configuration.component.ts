import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { FloatLabel, FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { ApiConfigPayload, ApiConfigService } from '../../../layout/service/api-configuration.service';

@Component({
    selector: 'app-api-configuration',
    imports: [
        CardModule,
        ButtonModule,
        Dialog,
        InputTextModule,
        FloatLabel,
        FormsModule,
        ReactiveFormsModule,
        InputGroupModule,
        InputGroupAddonModule,
        SelectModule,
        InputNumberModule,
        FloatLabelModule,
        RippleModule,
        ToastModule,
        PasswordModule,
        CommonModule,
        AvatarModule,
        OverlayBadgeModule
    ],
    templateUrl: './api-configuration.component.html',
    styleUrl: './api-configuration.component.scss',
    providers: [MessageService]
})
export class ApiConfigurationComponent {
    visible = false;
    apiDialogVisible = false;
    formStatus = '';
    apiFormStatus = '';
    isEditMode = false;
    isShowCreate = true;
    configurationData: ApiConfigPayload | undefined;

    agencyForm!: FormGroup;
    apiConfigForm!: FormGroup;
    private apiConfigService = inject(ApiConfigService);
    private messageService = inject(MessageService);

    constructor(private fb: FormBuilder) {
        this.apiConfigForm = this.fb.group({
            LoginID: ['', Validators.required],
            LoginPassword: ['', Validators.required],
            URL: ['https://api.platform.sabre.com/'],
            TraceID: ['', Validators.required],
            ClientId: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.getApiConfiguration();
    }

    showDialog() {
        this.visible = true;
    }

    showApiDialog() {
        this.apiConfigForm.markAsPristine();
        this.apiDialogVisible = true;
    }

    onSubmit() {
        if (this.apiConfigForm.invalid) {
            this.apiConfigForm.markAllAsTouched();
            return;
        }

        if (this.isEditMode) {
            this.editApiConfiguration();
        } else {
            this.createApiConfiguration();
        }
    }

    editApiConfiguration() {
        this.formStatus = 'loading';
        const payload: ApiConfigPayload = this.apiConfigForm.value;

        this.apiConfigService.editApiConfiguration(payload).subscribe({
            next: (response) => {
                if (response.Success) {
                    this.formStatus = 'success';
                    // this.apiConfigForm.reset();
                    this.showMessage('success', 'Success', response.Message || 'Api Configuration Update Successfully!');
                    this.apiDialogVisible = false;
                    this.getApiConfiguration();
                    setTimeout(() => {
                        this.formStatus = 'idle';
                    }, 1000);
                } else {
                    this.formStatus = 'idle';
                    this.showMessage('error', 'Error', response.Message || 'Error In Api Configuration Request.');
                }
            },
            error: (err) => {
                this.formStatus = 'idle';
                console.error('Edit API error', err);
            }
        });
    }

    createApiConfiguration() {
        this.formStatus = 'loading';
        const payload: ApiConfigPayload = this.apiConfigForm.value;

        this.apiConfigService.createApiConfiguration(payload).subscribe({
            next: (response) => {
                if (response.Success) {
                    this.formStatus = 'success';
                    // this.apiConfigForm.reset();
                    this.showMessage('success', 'Success', response.Message || 'Api Configuration Created Successfully!');
                    this.apiDialogVisible = false;
                    this.getApiConfiguration();
                } else {
                    this.formStatus = 'idle';
                    this.showMessage('error', 'Error', response.Message || 'Error In Api Configuration Request.');
                }
            },
            error: (err) => {
                this.formStatus = 'idle';
                console.error('Edit API error', err);
            }
        });
    }

    getApiConfiguration() {
        this.apiConfigService.getApiConfiguration().subscribe({
            next: (response) => {
                if (response.Success && response.Payload) {
                    this.configurationData = response.Payload;
                    this.apiConfigForm.patchValue({
                        LoginID: response.Payload.LoginID,
                        LoginPassword: response.Payload.LoginPassword,
                        // URL: response.Payload.URL,
                        TraceID: response.Payload.TraceID,
                        ClientId: response.Payload.ClientId
                    });

                    this.isShowCreate = false;
                } else {
                    this.apiConfigForm.reset();
                    this.showMessage('warn', 'Warning', 'Api configuration not found!');
                }
            },
            error: (err) => {}
        });
    }

    openEditDialog() {
        this.isEditMode = true;
        this.apiDialogVisible = true;
        // this.apiConfigForm.patchValue(apiData);
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.apiDialogVisible = true;
        this.apiConfigForm.reset();
    }

    showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail });
    }
}
