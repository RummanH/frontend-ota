import { ChangeDetectorRef, Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PreloaderService } from '../../../core/services/preloader.service';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss'],
  imports: [CommonModule],
})
export class PreloaderComponent implements OnInit, OnDestroy {
  private preloaderService = inject(PreloaderService);
  private cdRef = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  public showPreloader = true;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event) {
    event.preventDefault();
  }

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
