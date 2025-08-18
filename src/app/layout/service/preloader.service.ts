import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PreloaderService {
    private count = 0;
    private preloaderSubject = new BehaviorSubject<boolean>(false);

    constructor() {}

    get preloader$(): Observable<boolean> {
        return this.preloaderSubject.asObservable();
    }

    requestStarted() {
        if (++this.count === 1) {
            this.preloaderSubject.next(true);
        }
    }

    requestEnded() {
        if (this.count === 0 || --this.count === 0) {
            setTimeout(() => {
                this.preloaderSubject.next(false);
            }, 200);
        }
    }

    resetSpinner() {
        setTimeout(() => {
            this.count = 0;
            this.preloaderSubject.next(false);
        }, 200);
    }

    showSpinner() {
        this.preloaderSubject.next(true);
        setTimeout(() => {
            this.count = 0;
            this.preloaderSubject.next(false);
        }, 200);
    }
}
