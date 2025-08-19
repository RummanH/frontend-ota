import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../common-module/services/auth.service';

@Component({
  providers: [MessageService],
  selector: 'app-registration',
  imports: [FormsModule, ReactiveFormsModule, ToastModule, CommonModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  registrationForm!: FormGroup;
  formStatus: 'idle' | 'loading' | 'success' = 'idle';

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.formStatus = 'loading';

    this.authService.registerUser(this.registrationForm.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.formStatus = 'success';
          this.registrationForm.reset();
          this.showMessage('success', 'Request Sent', 'Your registration request has been sent successfully.');
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.formStatus = 'idle';
          this.showMessage('error', 'Registration Error', response?.message || 'There was an error processing your registration request.');
        }
      },
      error: (err) => {
        this.formStatus = 'idle';
        console.error('HTTP Error:', err);
      },
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
