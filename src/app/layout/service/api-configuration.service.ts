import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AllApiService } from './all-api.service';

export interface ApiConfigPayload {
    LoginID: string;
    LoginPassword: string;
    URL: string;
    PCC: string;
    ClientId: string;
    TraceID: string;
}

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
    private allApiService = inject(AllApiService);
    private http = inject(HttpClient);
    private editEndpoint = this.allApiService.editApiConfiguration;
    private createEndpoint = this.allApiService.createApiConfiguration;
    private getEndpoint = this.allApiService.getApiConfiguration;

    constructor() {}

    editApiConfiguration(payload: ApiConfigPayload): Observable<any> {
        const headers = new HttpHeaders().set('skip-preloader', 'true');
        return this.http.post<any>(this.editEndpoint, payload, { headers });
    }

    createApiConfiguration(payload: ApiConfigPayload): Observable<any> {
        const headers = new HttpHeaders().set('skip-preloader', 'true');
        return this.http.post<any>(this.createEndpoint, payload, { headers });
    }

    getApiConfiguration(): Observable<any> {
        return this.http.get<ApiConfigPayload>(this.getEndpoint);
    }
}
