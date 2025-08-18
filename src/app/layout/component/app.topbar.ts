import { Component, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule, CommonModule, StyleClassModule, ButtonModule, MenuModule, BadgeModule, RippleModule, AvatarModule],
  template: `
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <button class="layout-menu-button layout-topbar-action">
          <i class="pi pi-bars"></i>
        </button>
      </div>

      <div class="layout-topbar-actions mt-3">
        <div class="layout-topbar-menu hidden lg:block">
          <div class="layout-topbar-menu-content">
            <p-menu #menu [model]="items" popup="true"></p-menu>
            <button type="button" pButton icon="pi pi-user" label="Profile" (click)="menu.toggle($event)"></button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AppTopbar {
  @ViewChild('menu') menu!: Menu;

  items: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', routerLink: ['/profile'] },
    { label: 'Settings', items: [{ label: 'Logout', icon: 'pi pi-sign-out', routerLink: ['/auth/login'] }] },
  ];
}
