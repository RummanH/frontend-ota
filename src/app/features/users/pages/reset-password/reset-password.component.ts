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
import { AuthService } from '../../../../core/services/auth.service';

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

  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  token;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.resetForm = this.fb.group(
      {
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      console.log(params)
      this.token = params.code;
    });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  get password() {
    return this.resetForm.get('password')!;
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword')!;
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.formStatus = 'loading';

    const password = this.resetForm.value.password;

    const model = {
      password,
      token: this.token,
    };

    this.authService.resetPassword(model).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.formStatus = 'success';
          this.showMessage('success', 'Password Reset Successful', res.message || 'Your password has been reset successfully.');

          setTimeout(() => {
            this.router.navigate(['/users/login']);
          }, 3000);
        } else {
          this.formStatus = 'idle';
          this.showMessage('error', 'Reset Failed', res.message || 'Could not reset your password. Please verify your inputs and try again.');
        }
      },
      error: (err) => {
        this.formStatus = 'idle';
        this.showMessage('error', 'Reset Failed', err.error.message || 'An error occurred while resetting your password. Please try again.');
        console.error('Password reset error:', err);
      },
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
