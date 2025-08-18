import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthService } from '../../layout/service/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-sub-user',
  imports: [CommonModule, TableModule, FormsModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, RatingModule, InputTextModule, TextareaModule, SelectModule, RadioButtonModule, InputNumberModule, DialogModule, TagModule, InputIconModule, IconFieldModule, ConfirmDialogModule, DatePickerModule, ReactiveFormsModule, ToggleSwitchModule, CheckboxModule],
  templateUrl: './sub-user.component.html',
  styleUrl: './sub-user.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class SubUserComponent {
  subUserForm: FormGroup;
  subUserDialogVisible = false;
  selectedUser: any = null;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  isEditMode = false;
  permissionList = [
    {
      key: 'canSearch',
      label: 'Flight Search',
      description: 'Search flights and send quotes',
      icon: 'pi pi-search text-lg',
    },
    {
      key: 'canEdit',
      label: 'Ticket Modifications',
      description: 'Edit price, segments, and status',
      icon: 'pi pi-pen-to-square text-lg',
    },
    {
      key: 'canModifyProfile',
      label: 'Profile Update',
      description: 'Edit user profile and modify ticket template',
      icon: 'pi pi-user-edit text-lg',
    },

    {
      key: 'canViewRetrievedTickets',
      label: 'View Retrieved Tickets',
      description: 'Access retrieved tickets list',
      icon: 'pi pi-file-check text-lg',
    },
  ];

  ngOnInit() {
    this.subUserForm = this.fb.group({
      Name: ['', Validators.required],
      UserName: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
      Password: ['', [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$')]],
      Email: ['', [Validators.required, Validators.email]],
      MobileNo: ['', Validators.required],
      permissions: this.fb.group({
        canSearch: [false],
        canEdit: [false],
        canModifyProfile: [false],
        canViewRetrievedTickets: [false],
      }),
    });

    // Watch permission values to track button state
    this.subUserForm.get('permissions')?.valueChanges.subscribe(() => {
      this.updateAllPermissionsStatus();
    });

    this.updateAllPermissionsStatus();

    this.loadSubUsers();
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.subUserForm.reset();
    this.subUserDialogVisible = true;
  }

  editUser(user: any) {
    this.authService.getSubUserPermissions(user.Id).subscribe((res: any) => {
      if (res.Success) {
        this.isEditMode = true;
        this.selectedUser = user;
        user.Email = user.UserEmail;

        this.subUserForm.get('Password')?.clearValidators();
        this.subUserForm.get('Password')?.updateValueAndValidity();
        this.subUserForm.patchValue(user);

        const permissionMap: any = {
          AirSearch: 'canSearch',
          AirTicketModify: 'canEdit',
          AgentProfileModify: 'canModifyProfile',
          ViewRetrieveTickets: 'canViewRetrievedTickets',
        };

        const patchedPermissions: any = {};
        res.Payload.forEach((p) => {
          const key = permissionMap[p.PrivilegeName];
          if (key) patchedPermissions[key] = p.HasPermission;
        });

        // Patch to form
        this.subUserForm.get('permissions')?.patchValue(patchedPermissions);
        this.subUserDialogVisible = true;
      }
    });
  }

  saveSubUser() {
    if (this.subUserForm.invalid) return;
    const formValue = this.subUserForm.value;
    const SubUserPermissions = [
      {
        PrivilegeName: 'AirSearch',
        HasPermission: formValue.permissions.canSearch,
      },
      {
        PrivilegeName: 'AirTicketModify',
        HasPermission: formValue.permissions.canEdit,
      },
      {
        PrivilegeName: 'AgentProfileModify',
        HasPermission: formValue.permissions.canModifyProfile,
      },
      {
        PrivilegeName: 'ViewRetrieveTickets',
        HasPermission: formValue.permissions.canViewRetrievedTickets,
      },
    ];

    formValue.isEditMode = this.isEditMode;
    formValue.SubUserPermissions = SubUserPermissions;
    formValue.Id = this.selectedUser?.Id;

    Object.keys(formValue).forEach((key) => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim();
      }
    });

    console.log(formValue);

    this.authService.createSubUser(formValue).subscribe({
      next: (res: any) => {
        if (res?.Success) {
          this.loadSubUsers();
          this.subUserDialogVisible = false;

          this.showMessage('success', this.isEditMode ? 'Sub-User Updated' : 'Sub-User Created', this.isEditMode ? 'The sub-user has been updated successfully.' : 'The sub-user has been created successfully.');
        } else {
          this.subUserDialogVisible = true;

          this.showMessage('error', this.isEditMode ? 'Sub-User Update Failed' : 'Sub-User Creation Failed', res?.Message || (this.isEditMode ? 'An error occurred while updating the sub-user. Please try again.' : 'An error occurred while creating the sub-user. Please try again.'));
        }
      },
      error: (err: any) => {
        this.subUserDialogVisible = true;
        this.showMessage('error', 'Operation Failed', err?.error?.Message || err?.message || 'Something went wrong. Please try again later.');
      },
    });
  }

  loadSubUsers() {
    this.authService.getAllSubUsers().subscribe({
      next: (res: any) => {
        if (res?.Success && res.Payload?.length) {
          this.subUserList = res.Payload;
        } else {
          this.showMessage('error', 'No Sub Users Found', 'There are currently no sub-users available.');
        }
      },
      error: (err) => {
        this.showMessage('error', 'No Sub Users Found', 'There are currently no sub-users available.');
        console.error('Error loading sub users:', err);
      },
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary' | string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  toggleStatus(IsActive: boolean, Id: string) {
    this.authService.activeInactiveUser({ IsActive, isEditMode: false, Id }).subscribe({
      next: (res: any) => {
        if (res?.Success) {
          this.loadSubUsers();

          this.subUserDialogVisible = false;
          this.showMessage('success', 'Sub-User Updated', res?.Message || 'Sub user Updated Successfully!');
        } else {
          this.subUserDialogVisible = true;
          this.showMessage('error', 'Sub-User Update Failed', res?.Message || 'There was an error updating the sub user!');
        }
      },
      error: (err: any) => {
        this.subUserDialogVisible = true;
        this.showMessage('error', 'Operation Failed', err?.error?.Message || 'Something went wrong. Please try again later.');
      },
    });
  }

  filterDialogVisible = false;

  filters = {
    name: '',
    email: '',
    mobileNo: '',
    status: null,
  };

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  openFiltering() {
    this.filterDialogVisible = true;
  }

  clearFilters() {
    this.filters = {
      name: '',
      email: '',
      mobileNo: '',
      status: null,
    };
    this.applyFilters();
  }

  applyFilters() {
    // Call API or filter locally based on this.filters
    this.filterDialogVisible = false;
  }

  isLoading = false;

  subUserList = [];

  confirmDelete(event: Event, userId) {
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
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirm',
        severity: 'danger',
        outlined: true,
      },

      accept: () => this.submitUserDelete(userId),
    });
  }

  submitUserDelete(userId: number) {
    this.authService.deleteSubUser(userId).subscribe({
      next: (res: any) => {
        if (res?.Success) {
          this.showMessage('success', 'Sub-User Deleted', 'The user has been removed successfully.');
          this.loadSubUsers();
        } else {
          this.showMessage('error', 'Deletion Failed', 'Unable to remove the sub-user. Please try again later.');
        }
      },
      error: (err) => {
        this.showMessage('error', 'Deletion Failed', 'Unable to remove the sub-user. Please try again later.');
      },
    });
  }

  uncheckAllPermissions() {
    const permissionsGroup = this.subUserForm.get('permissions') as FormGroup;
    Object.keys(permissionsGroup.controls).forEach((key) => {
      permissionsGroup.get(key)?.setValue(false);
    });
  }

  allPermissionsChecked = false;
  togglePermission(key: string) {
    const control = this.subUserForm.get(['permissions', key]);
    if (control) {
      control.setValue(!control.value);
    }
  }

  updateAllPermissionsStatus() {
    const permissions = this.subUserForm.get('permissions')?.value;
    const values = Object.values(permissions);
    this.allPermissionsChecked = values.every((v) => v === true);
  }

  toggleAllPermissions() {
    const permissionsGroup = this.subUserForm.get('permissions') as FormGroup;
    const shouldCheckAll = !this.allPermissionsChecked;

    Object.keys(permissionsGroup.controls).forEach((key) => {
      permissionsGroup.get(key)?.setValue(shouldCheckAll);
    });

    this.allPermissionsChecked = shouldCheckAll;
  }

  getPermissionValue(key: string): boolean {
    return this.subUserForm.get('permissions.' + key)?.value;
  }
}
