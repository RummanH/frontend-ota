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

  loadUserFromServer() {
    this.httpclient.get<User>(this.allapi.agentProfileView).subscribe({
      next: (res: any) => this.setUser(res.Payload),
      error: () => {
        this.clearUser();
      },
    });
  }

  loadUserPermissions() {
    this.httpclient
      .get(this.allapi.getSubUserPermissions, {
        params: { subUserId: 0 },
      })
      .subscribe((res: any) => {
        if (res.Success) {
          // this.setUser({ ...this.user(), ...res.Payload });
        }
      });
  }

  getPermission() {
    return this.httpclient.get(this.allapi.getSubUserPermissions, {
      params: { subUserId: 0 },
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.httpclient.get<DashboardStats>(this.allapi.getDashboardStats);
  }

  retrieveTicket(pnr: string | null, isReissueSearch: boolean = false) {
    return this.httpclient.post(this.allapi.retrieveTicket, { PNR: pnr, IsReissueSearch: isReissueSearch });
  }

  getTicketAfterRetrieve(pnr: string | null, isReissueSearch: boolean = false) {
    return this.httpclient.post(this.allapi.getTicketAfterRetrieve, { PNR: pnr, IsReissueSearch: isReissueSearch });
  }

  editTicketPrice(requestModel: any) {
    return this.httpclient.post(this.allapi.editTicketPrice, requestModel);
  }

  getPDFFromHTML(value: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const url = this.allapi.gethtmlToPdf;
    return this.httpclient.post(url, value, httpOptions);
  }

  getDocFromHTML(value: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const url = this.allapi.gethtmlToDoc;
    return this.httpclient.post(url, value, httpOptions);
  }

  getRetrievedTickets(payload: any): Observable<any> {
    const url = this.allapi.getRetrievedTicket;
    return this.httpclient.post<any>(url, payload);
  }

  sendBookingConfirmPageEmail(model: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.httpclient.post<any>(this.allapi.sendTicketinEmail, model, httpOptions);
  }

  addExtraServices(data: any): Observable<any> {
    return this.httpclient.post(this.allapi.addExtraServices, data);
  }

  getAirports(value: string) {
    const url = this.allapi.getCities + value;
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.get(url, { headers });
  }

  addAirSegment(data: any): Observable<any> {
    return this.httpclient.post(this.allapi.addAirSegmentInfo, data);
  }

  getAirlineList(value: string) {
    const url = this.allapi.getAirlinesName + value;
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.get(url, { headers });
  }

  deleteSegmentInfo(payload: any) {
    const url = this.allapi.deleteSegmentInfo;
    return this.httpclient.post(url, payload);
  }

  sendResetPasswordRequest(email: string) {
    const url = this.allapi.forGotPassword + encodeURIComponent(email);
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.get(url, { headers });
  }

  resetPassword(model: { NewPassword: string; OTP: string }) {
    const headers = new HttpHeaders().set('skip-preloader', 'true');
    return this.httpclient.post(this.allapi.passwordResetConfirm, model, { headers });
  }

  searchFlights(model: FlightSearchModel, journeyType: any): Observable<any> {
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

  createSubUser(data: any) {
    if (data.isEditMode) {
      data.isEditMode = undefined;
      return this.httpclient.post(this.allapi?.updateSubUser, data);
    }
    data.isEditMode = undefined;
    return this.httpclient.post(this.allapi?.createSubUser, data);
  }

  activeInactiveUser(data: any) {
    return this.httpclient.post(this.allapi?.activeInactiveUser, data);
  }

  getAllSubUsers() {
    return this.httpclient.get(this.allapi?.getAllSubUsers);
  }

  deleteSubUser(userId: number) {
    return this.httpclient.post(this.allapi?.deleteSubUser, { Id: userId });
  }

  editTicketStatus(model) {
    return this.httpclient.post(this.allapi.editTicketStatus, model);
  }

  getSubUserPermissions(subUserId) {
    return this.httpclient.get(this.allapi.getSubUserPermissions, {
      params: { subUserId },
    });
  }
}
