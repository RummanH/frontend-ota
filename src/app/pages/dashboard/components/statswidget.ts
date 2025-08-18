import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../layout/service/auth.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Tickets</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardStats?.TotalTicketCount }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-ticket text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">24 new </span>
                <span class="text-muted-color">since last visit</span> -->
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div class="mr-1">
                        <span class="block text-muted-color font-medium mb-4">Tickets (Last 30 Days)</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardStats?.Last30DaysTicketCount }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-calendar text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">%52+ </span>
                <span class="text-muted-color">since last week</span> -->
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Sale (Last 30 Days)</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardStats?.Last30DaysTotalSale }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-money-bill text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">520 </span>
                <span class="text-muted-color">newly registered</span> -->
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Last Retrieve PNR</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardStats?.LastPNR }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-hashtag text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <!-- <span class="text-primary font-medium">85 </span>
                <span class="text-muted-color">responded</span> -->
            </div>
        </div>`
})
export class StatsWidget {
    dashboardStats: any;
    private authService = inject(AuthService);
    ngOnInit(): void {
        this.authService.getDashboardStats().subscribe({
            next: (data) => {
                if (data.Success) {
                    this.dashboardStats = data.Payload;
                    console.log(this.dashboardStats);
                }
            },
            error: (err) => {
                console.error('Error fetching dashboard stats:', err);
            }
        });
    }
}
