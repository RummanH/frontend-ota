import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PreloaderService } from '../../service/preloader.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-preloader',
    templateUrl: './preloader.component.html',
    styleUrls: ['./preloader.component.scss'],
    imports: [CommonModule]
})
export class PreloaderComponent implements OnInit, OnDestroy {
    // https://loading.io/spinner/dna/-dna-biology-rna-biohazard-spiral-helix-spin-ball
    // https://loading.io/spinner/flipball/-gce-google-flip-circle
    // https://loading.io/spinner/harmony/-taiji-yinyang-harmony-balance-symmetry-spinner-loader

    @HostListener('contextmenu', ['$event'])
    onRightClick(event: Event) {
        event.preventDefault();
    }

    subscription?: Subscription;

    showPreloader = true;

    constructor(
        private cdRef: ChangeDetectorRef,
        private preloaderService: PreloaderService
    ) {}

    ngOnInit() {
        this.init();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    init() {
        this.subscription = this.preloaderService.preloader$.subscribe((status) => {
            this.showPreloader = status;
            this.cdRef.detectChanges();
        });
    }

    clickedOnPreloader(): void {
        this.preloaderService.resetSpinner();
    }
}
