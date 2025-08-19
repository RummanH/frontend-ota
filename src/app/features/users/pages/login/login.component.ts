import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-login',
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, FormsModule, CommonModule, ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
})
export class LoginComponent {
  loginForm!: FormGroup;
  formStatus: 'idle' | 'loading' | 'success' = 'idle';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.formStatus = 'loading';

    const { password, email } = this.loginForm.value;

    this.authService.login({ email: email?.toLowerCase().trim(), password: password.trim() }).subscribe({
      next: (res) => {
        if (res.status) {
          this.formStatus = 'success';
          this.showMessage('success', 'Login Successful', 'You have logged in successfully.');
          localStorage.setItem('accessToken', res.payload.accessToken);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 500);
        } else {
          this.formStatus = 'idle';
          this.showMessage('error', 'Login Failed', res.message || 'Unable to log in. Please check your credentials and try again.');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.formStatus = 'idle';
        this.showMessage('error', 'Login Failed', 'Unable to log in. Please check your credentials and try again.');
      },
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
