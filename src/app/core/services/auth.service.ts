import { computed, Injectable, signal } from '@angular/core';
import { AllApiService } from './all-api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// user.model.ts
export interface User {
  agentID: number;
  name: string;
  agentLastName: string;
  profilePictureName: string;
  profilePictureFilePath: string;
  AgentCountry: number;
  agentCountryName: string;
  agentAddress: string;
  AgencyName: string;
  agencyLogo: string;
  logoFIlePath: string;
  isSiteLogoShow: boolean;
  agencyContactNo: string;
  agencyEmail: string;
  AgencyAddress: string;
  userPhone: string;
  userEmail: string;
  fullName: string;
  passwordModicationDate: string;
  AgentCity: string;
  AgentCountryName: string;
  AgentCityName: string;
  AgencyEmail: string;
  AgencyContactNo: string;
  UserEmail: string;
  UserPhone: string;
  LogoFIlePath: string;
  AgencyCity: string;
  AgencyCountry: string;
  AgencyCountryName: string;
  AgencyCityName: string;
  TemplateId: number;
  IsSubUser: boolean;
}

export interface FlightSearchModel {
  JourneyType: number;
  Origin?: string;
  Destination?: string;
  DepartureDate: string | Date | null;
  ReturnDate: string | Date | null | '';
  ClassType: string;
  IsFlexSearch: boolean;
  NoOfInfant: number;
  NoOfChildren: number;
  NoOfAdult: number;
  ChildrenAges: number[];
  CarriersCode: string[];
}

// dashboard-stats.model.ts
export interface DashboardStats {
  Payload: {
    TotalTicketCount: number;
    ThisMonthTicketCount: number;
    ThisMonthTotalSale: string;
    LastPNR: string;
  };
  Success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private allapi: AllApiService,
    private httpclient: HttpClient,
  ) {}

  private userSignal = signal<User | null>(null);
  readonly user = computed(() => this.userSignal());

  getCountryList(): Observable<any> {
    return this.httpclient.get(this.allapi.countryList);
  }

  getCityList(countryID: string): Observable<any> {
    const cityApi = this.allapi.cityList + countryID;
    return this.httpclient.get(cityApi);
  }

  registerUser(payload: { name: string; email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.post(this.allapi.registration, payload, { headers });
  }

  editProfile(payload: any): Observable<any> {
    return this.httpclient.post(this.allapi.editProfile, payload);
  }

  getToken() {
    let token = localStorage.getItem('accessToken');
    return token ? token : false;
  }

  removeToken() {
    localStorage.clear();
    sessionStorage.clear();
  }

  login(data: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.post(this.allapi.authenticate, data, { headers });
  }

  loggedIn() {
    if (localStorage.getItem('token') !== null || sessionStorage.getItem('token') !== null) {
      return true;
    }
    return false;
  }

  setUser(user: User) {
    this.userSignal.set(user);
  }

  clearUser() {
    this.userSignal.set(null);
  }

  getUserValue(): User | null {
    return this.userSignal();
  }

  getAirports(value: string) {
    const url = this.allapi.getCities + value;
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.get(url, { headers });
  }

  getAirlineList(value: string) {
    const url = this.allapi.getAirlinesName + value;
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.get(url, { headers });
  }

  sendResetPasswordRequest(email: string) {
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.post(this.allapi.forGotPassword, { email }, { headers });
  }

  resetPassword(model: { password: string; token: string }) {
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.post(this.allapi.passwordResetConfirm, model, { headers });
  }

  searchFlights(model: any, journeyType: any): Observable<any> {
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    if (journeyType !== 3) {
      return this.httpclient.post<any>(this.allapi.flightSearch, model, { headers });
    } else {
      return this.httpclient.post<any>(this.allapi.flightSearchMulti, model, { headers });
    }
  }

  agentChangePassword(payload: { ExistingPassword: string; NewPassword: string }): Observable<any> {
    return this.httpclient.post(this.allapi.passwordChange, payload);
  }
}
