import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../common-module/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, FormsModule, CommonModule, FloatLabelModule, ToastModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService],
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  formStatus: 'idle' | 'loading' | 'success' = 'idle';
  otp = '';

  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.resetForm = this.fb.group(
      {
        Password: ['', [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$')]],
        ConfirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      console.log(params);
      this.otp = params.rcode;
    });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('Password')?.value;
    const confirmPassword = form.get('ConfirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get password() {
    return this.resetForm.get('Password')!;
  }

  get confirmPassword() {
    return this.resetForm.get('ConfirmPassword')!;
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.formStatus = 'loading';

    const password = this.resetForm.value.Password;
    const otp = this.otp;

    const model = {
      NewPassword: password,
      OTP: otp,
    };

    this.authService.resetPassword(model).subscribe({
      next: (response: any) => {
        if (response.Success) {
          this.formStatus = 'success';
          this.showMessage('success', 'Password Reset Successful', 'Your password has been reset successfully.');

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.formStatus = 'idle';
          this.showMessage('error', 'Reset Failed', 'Could not reset your password. Please verify your inputs and try again.');
        }
      },
      error: (err) => {
        this.formStatus = 'idle';
        this.showMessage('error', 'Reset Failed', 'An error occurred while resetting your password. Please try again.');
        console.error('Password reset error:', err);
      },
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
