import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { FloatLabel, FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FileValidationService } from '../../layout/service/file-validation.service';
import { AuthService } from '../../layout/service/auth.service';
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
import { EncrDecrService } from '../../layout/service/encr-decr.service';

@Component({
  selector: 'app-profile',
  imports: [CardModule, ButtonModule, Dialog, InputTextModule, FloatLabel, FormsModule, ReactiveFormsModule, InputGroupModule, InputGroupAddonModule, SelectModule, InputNumberModule, FloatLabelModule, RippleModule, ToastModule, PasswordModule, CommonModule, AvatarModule, OverlayBadgeModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [MessageService],
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private encrDecr = inject(EncrDecrService);
  user = this.authService.user;

  visible: boolean = false;

  agencyForm!: FormGroup;
  changePasswordForm!: FormGroup;

  uploadedImageUrl: string | null = null;
  formStatus: 'idle' | 'loading' | 'success' = 'idle';

  countries = [];
  isSubUser = false;

  cities = [];
  selectedCountry: any;

  constructor(
    private fb: FormBuilder,
    private fileValidator: FileValidationService,
    private messageService: MessageService,
    private router: Router,
  ) {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.agencyForm.patchValue({
          AgencyName: user.AgencyName || '',
          AgentAddress: user.AgencyAddress || '',
        });
        const country: any = this.countries.find((x: any) => x.countryID === user.AgencyCountry);

        this.authService.getCityList(country.countryID).subscribe((data: any) => {
          if (data.success === true) {
            this.cities = data.payload;
            const city = this.cities.find((x: any) => x.cityID == user.AgencyCity);

            this.agencyForm.patchValue({
              AgentCountry: country,
              AgentCity: city || null,
            });
          }
        });
      }
    });
  }

  showDialog() {
    this.visible = true;
  }

  passwordFormStatus: 'idle' | 'loading' | 'success' = 'idle';
  changePasswordVisible = false;

  showChangePasswordModal() {
    this.changePasswordVisible = true;
  }

  onChangePassword() {
    if (this.changePasswordForm.invalid || this.passwordsDoNotMatch) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.passwordFormStatus = 'loading';

    const formData = {
      ExistingPassword: this.changePasswordForm.value.currentPassword?.trim(),
      NewPassword: this.changePasswordForm.value.newPassword?.trim(),
    };

    this.authService.agentChangePassword(formData).subscribe({
      next: (res: any) => {
        if (res.Success) {
          this.passwordFormStatus = 'success';
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully!' });
          this.changePasswordForm.reset();
          this.changePasswordVisible = false;
        } else {
          this.passwordFormStatus = 'idle';
          this.messageService.add({ severity: 'error', summary: 'Error ', detail: res.Message || 'Password changed not successful!' });
        }
      },
      error: (err: any) => {
        this.passwordFormStatus = 'idle';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to change password.' });
      },
    });
  }

  ngOnInit(): void {
    this.agencyForm = this.fb.group({
      AgencyName: ['', Validators.required],
      AgentAddress: ['', Validators.required],
      AgentCountry: ['', Validators.required],
      AgentCity: ['', Validators.required],
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });

    this.authService.getCountryList().subscribe((data: any) => {});

    if (localStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(localStorage.getItem('isSubUser'));
    } else if (sessionStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(sessionStorage.getItem('isSubUser'));
    } else {
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 500);
    }
  }

  get passwordsDoNotMatch(): boolean {
    const { newPassword, confirmPassword } = this.changePasswordForm.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword;
  }

  getCityList(event: SelectChangeEvent) {
    this.authService.getCityList(event.value.countryID).subscribe((data: any) => {
      if (data.success === true) {
        this.cities = data.payload;
      }
    });
  }

  onSubmit() {
    if (this.agencyForm.valid) {
      this.formStatus = 'loading';
      const formData = new FormData();

      console.log(this.agencyForm.value.City);

      // Append simple fields
      formData.append('AgencyName', this.agencyForm.value.AgencyName);
      formData.append('AgentAddress', this.agencyForm.value.AgentAddress);
      formData.append('AgentCountry', this.agencyForm.value.AgentCountry.countryID);
      formData.append('AgentCity', this.agencyForm.value.AgentCity.cityID);

      this.authService.editProfile(formData).subscribe({
        next: (response: any) => {
          if (response.Success) {
            this.formStatus = 'success';
            // this.agencyForm.reset();
            this.showMessage('success', 'Success', response.Message || 'Registration Request Sent Successfully.');
            this.visible = false;
          } else {
            this.formStatus = 'idle';
            this.showMessage('error', 'Error', response.Message || 'Error In Registration Request.');
            console.warn('Registration failed:', response.Message || 'Error In Registration Request.');
          }
        },
        error: (err) => {
          this.formStatus = 'idle';
          console.error('HTTP Error:', err);
        },
      });
    } else {
      this.agencyForm.markAllAsTouched();
    }
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  removeUploadedImage() {
    this.uploadedImageUrl = null;
    this.agencyForm.get('AttachmentFilePath')?.reset();
  }

  onUpload(event: any, formControlName: string): void {
    const input = event.target as HTMLInputElement;
    console.log(input.files);

    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.fileValidator
        .validateFile(file, 'doc')
        .then((isValid) => {
          if (!isValid) {
            this.showMessage('error', 'File Validation Failed', 'File upload failed. Please upload a valid file or reduce the file size.');
            this.agencyForm.get(formControlName)?.setValue(null);
          } else {
            const formData = new FormData();
            const logoFile = file;
            if (logoFile && logoFile instanceof File) {
              formData.append('logoFIlePath', logoFile);
            }

            this.authService.editProfile(formData).subscribe({
              next: (response: any) => {
                if (response.Success) {
                  this.formStatus = 'success';
                  // this.agencyForm.reset();
                  this.showMessage('success', 'Success', response.Message || 'Registration Request Sent Successfully.');
                } else {
                  this.formStatus = 'idle';
                  this.showMessage('error', 'Error', response.Message || 'Error In Registration Request.');
                  console.warn('Registration failed:', response.Message || 'Error In Registration Request.');
                }
              },
              error: (err) => {
                this.formStatus = 'idle';
                console.error('HTTP Error:', err);
              },
            });
          }
        })
        .catch((error) => {
          this.showMessage('error', 'File Validation Failed', 'Error reading file.');
        });
    }
  }
}
