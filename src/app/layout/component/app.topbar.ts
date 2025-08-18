import { Component, effect, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../service/auth.service';
import { EncrDecrService } from '../service/encr-decr.service';
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule, CommonModule, StyleClassModule, Menu, ButtonModule, MenuModule, BadgeModule, RippleModule, AvatarModule],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
        <i class="pi pi-bars"></i>
      </button>
      <a class="layout-topbar-logo w-20" routerLink="/">
        <img src="assets/img/Sabre-logo_RGB-RED.png" alt="" />
      </a>
    </div>

    <div class="layout-topbar-actions mt-3">
      <div class="layout-config-menu">
        <!-- <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button> -->
        <!-- <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div> -->
      </div>

      <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <!-- <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button> -->
          <!-- <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button> -->
          <button type="button" class="layout-topbar-action" (click)="menu.toggle($event)">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </button>

          <div class="">
            <p-menu appendTo="body" #menu [model]="items" class="flex justify-center" styleClass="w-full md:w-60" [popup]="true">
              <ng-template #submenuheader let-item>
                <span class="text-primary font-bold">{{ item.label }}</span>
              </ng-template>
              <ng-template #item let-item>
                <a pRipple class="flex items-center p-menu-item-link">
                  <span [class]="item.icon"></span>
                  <span class="ml-2">{{ item.label }}</span>
                </a>
              </ng-template>
              <ng-template #end *ngIf="user() as loggedInUser">
                <button pRipple class="relative overflow-hidden w-full border-0 bg-transparent flex items-center p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-none cursor-pointer transition-colors duration-200">
                  <span class="inline-flex flex-col">
                    <span class="font-bold">{{ loggedInUser.AgencyName }}</span>
                  </span>
                </button>
              </ng-template>
            </p-menu>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
export class AppTopbar {
  private authService = inject(AuthService);
  private encrDecr = inject(EncrDecrService);
  user = this.authService.user;
  permissions;
  showFlightTab;
  isSubUser = false;
  items: MenuItem[] | undefined;
  ngOnInit() {
    if (localStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(localStorage.getItem('isSubUser'));
    } else if (sessionStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(sessionStorage.getItem('isSubUser'));
    } else {
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 500);
    }

    this.items = [
      {
        label: 'Settings',
        items: [
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.logout(),
          },
        ],
      },
      {
        separator: true,
      },
    ];

    if (!this.isSubUser) {
      this.items[0]?.items.unshift({
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['profile']);
        },
      });
    } else {
      this.authService.getPermission().subscribe((res: any) => {
        if (res.Success) {
          this.permissions = res.Payload;
          if (this.permissions?.length) {
            if (this.permissions[2]?.HasPermission) {
              this.showFlightTab = true;
              if (this.showFlightTab) {
                this.items[0]?.items.unshift({
                  label: 'Profile',
                  icon: 'pi pi-user',
                  command: () => {
                    this.router.navigate(['profile']);
                  },
                });
              }
            }
          }
        }
      });
    }

    this.authService.loadUserFromServer();
  }

  constructor(
    public layoutService: LayoutService,
    private router: Router,
  ) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  logout() {
    this.authService.clearUser();
    this.authService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
