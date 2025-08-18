import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../service/auth.service';
import { EncrDecrService } from '../service/encr-decr.service';
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `,
})
export class AppMenu {
  model: MenuItem[] = [];
  isSubUser = false;
  private router = inject(Router);
  private authService = inject(AuthService);
  private encrDecr = inject(EncrDecrService);
  user = this.authService.user;
  permissions;
  showFlightTab = false;

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

    if (!this.isSubUser) {
      this.showFlightTab = true;
    } else {
      this.authService.getPermission().subscribe((res: any) => {
        if (res.Success) {
          this.permissions = res.Payload;
          if (this.permissions?.length) {
            if (this.permissions[0]?.HasPermission) {
              this.showFlightTab = true;
              if (this.showFlightTab) {
                this.model[0].items.push({
                  label: 'Flight Search',
                  icon: 'pi pi-fw pi-send',
                  routerLink: ['/pages/flight-search'],
                });
              }
            }

            if (this.permissions[2].HasPermission) {
              this.model.push({
                label: 'Settings',
                items: [
                  {
                    label: 'Ticket Templates',
                    icon: 'pi pi-fw pi-objects-column',
                    routerLink: ['/settings/choose-templates'],
                  },
                ],
              });
            }

            if (this.permissions[3].HasPermission) {
              if (this.showFlightTab) {
                this.model[0].items.splice(1, 0, {
                  label: 'Retrieved Tickets',
                  icon: 'pi pi-fw pi-file',
                  items: [
                    {
                      label: 'Confirm Tickets',
                      icon: 'pi pi-check-circle',
                      routerLink: ['/tickets'],
                      queryParams: { type: 'confirmed' },
                      routerLinkActiveOptions: { exact: true },
                    },
                    {
                      label: 'Cancel Tickets',
                      icon: 'pi pi-wallet',
                      routerLink: ['/tickets'],
                      queryParams: { type: 'cancel' },
                      routerLinkActiveOptions: { exact: true },
                    },
                    {
                      label: 'Void Tickets',
                      icon: 'pi pi-times-circle',
                      routerLink: ['/tickets'],
                      queryParams: { type: 'void' },
                      routerLinkActiveOptions: { exact: true },
                    },
                  ],
                });
              }
            }
          }
        }
      });
      this.authService.loadUserPermissions();
    }

    this.model = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/'],
          },
          {
            label: 'Retrieve PNR',
            icon: 'pi pi-fw pi-database',
            routerLink: ['/settings/pnr-retrieve'],
          },
        ],
      },
    ];

    if (!this.isSubUser) {
      this.model[0]?.items.push({
        label: 'Sub Users',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/pages/sub-user'],
      });
    }

    if (!this.isSubUser) {
      this.model[0].items.push({
        label: 'Flight Search',
        icon: 'pi pi-fw pi-send',
        routerLink: ['/pages/flight-search'],
      });

      this.model[0].items.splice(1, 0, {
        label: 'Retrieved Tickets',
        icon: 'pi pi-fw pi-file',
        items: [
          {
            label: 'Confirm Tickets',
            icon: 'pi pi-check-circle',
            routerLink: ['/tickets'],
            queryParams: { type: 'confirmed' },
            routerLinkActiveOptions: { exact: true },
          },
          {
            label: 'Cancel Tickets',
            icon: 'pi pi-wallet',
            routerLink: ['/tickets'],
            queryParams: { type: 'cancel' },
            routerLinkActiveOptions: { exact: true },
          },
          {
            label: 'Void Tickets',
            icon: 'pi pi-times-circle',
            routerLink: ['/tickets'],
            queryParams: { type: 'void' },
            routerLinkActiveOptions: { exact: true },
          },
        ],
      });

      this.model.push({
        label: 'Settings',
        items: [
          {
            label: 'Ticket Templates',
            icon: 'pi pi-fw pi-objects-column',
            routerLink: ['/settings/choose-templates'],
          },
        ],
      });
    }
  }
}
