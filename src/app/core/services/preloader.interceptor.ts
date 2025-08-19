import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PreloaderService } from './preloader.service';
import { SKIP_PRELOADER_HEADER_NAME } from '../../shared/constants';

@Injectable()
export class PreloaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(private preloaderService: PreloaderService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipPreloader = request.headers.get(SKIP_PRELOADER_HEADER_NAME);
    if (skipPreloader != 'true') {
      this.preloaderService.requestStarted();
    }
    const cloneRequest = (request = request.clone({
      headers: request.headers.delete(SKIP_PRELOADER_HEADER_NAME),
    }));
    return this.handler(cloneRequest, next);
  }

  handler(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
      tap({
        next: (event: any) => {
          if (event instanceof HttpResponse) {
            this.preloaderService.requestEnded();
          }
        },
        error: (error: any) => {
          this.preloaderService.resetSpinner();
        },
      }),
    );
  }
}
