import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-forgot-password',
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, FormsModule, CommonModule, FloatLabelModule, ToastModule, MessageModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [MessageService],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  formStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  resetPasswordMessage = '';

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.formStatus = 'loading';
    const email = this.forgotForm.value.email;

    this.authService.sendResetPasswordRequest(email).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.formStatus = 'success';
          this.resetPasswordMessage = res?.message;
          this.forgotForm.reset();
          this.showMessage('success', 'Reset Email Sent', res?.message || `A password reset link has been sent to your registered email. Please check your inbox.`);
        } else {
          this.formStatus = 'error';
          this.showMessage('error', 'Reset Failed', res?.message || `We couldn’t send the reset email. Please ensure the PCC is correct and try again.`);
        }
      },
      error: (err) => {
        this.formStatus = 'error';
        this.showMessage('error', 'Reset Failed', err.error.message || `We couldn’t send the reset email. Please ensure that the email settings are properly configured.`);
      },
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
