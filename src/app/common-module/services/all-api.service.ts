import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class AllApiService {
  baseURL = 'http://localhost:3001/';

  countryList = this.baseURL + 'CountryDDL';
  cityList = this.baseURL + 'CityDDL?CountryID=';
  registration = this.baseURL + 'users/signup';
  authenticate = this.baseURL + 'users/login';
  agentProfileView = this.baseURL + 'AgentProfileView';
  editProfile = this.baseURL + 'EditAgentProfileLogo';
  editApiConfiguration = this.baseURL + 'UpdateIataInformation';
  getApiConfiguration = this.baseURL + 'GetIataInformationById';
  createApiConfiguration = this.baseURL + 'IataInfoSave';
  getDashboardStats = this.baseURL + 'GetDashBoardCardData';
  getPaginatedReports = this.baseURL + 'GetPaginatedReports';
  retrieveTicket = this.baseURL + 'PnrSearchForTicket';
  editTicketPrice = this.baseURL + 'EtpirAirTicketEdit';
  gethtmlToPdf = this.baseURL + 'HtmlToPdfConvert';
  gethtmlToDoc = this.baseURL + 'HtmlToDocConvert';
  getRetrievedTicket = this.baseURL + 'GetRetrievedTicketInformation';
  getTicketAfterRetrieve = this.baseURL + 'GetAirTicket';
  sendTicketinEmail = this.baseURL + 'api/SendTicketEmail';
  addExtraServices = this.baseURL + 'AddExtraServiceInfo';
  getCities = this.baseURL + 'Auto/GetCities/?input=';
  addAirSegmentInfo = this.baseURL + 'AddAirSegmentInfo';
  deleteSegmentInfo = this.baseURL + 'DeleteSegmentInfo';
  getAirlinesName = this.baseURL + 'api/GetAirLinesBySearchString?SearchString=';
  forGotPassword = this.baseURL + 'ForgotPasswordRequest?UserName=';
  passwordResetConfirm = this.baseURL + 'PasswordReset';
  flightSearch = this.baseURL + 'flights/getFlightList';
  flightSearchMulti = this.baseURL + 'Etpir/AirSearchMulticity';
  passwordChange = this.baseURL + 'AgentChangePasswoed';
  createSubUser = this.baseURL + 'SubAgent/Create';
  updateSubUser = this.baseURL + 'agent/EditSubUser';
  getAllSubUsers = this.baseURL + 'agent/GetAllSubUser';
  activeInactiveUser = this.baseURL + 'agent/SubUserActiveStatus';
  deleteSubUser = this.baseURL + 'DeleteSubUser';
  editTicketStatus = this.baseURL + 'EditTicketStatus';
  getSubUserPermissions = this.baseURL + 'SubUser/GetPermission';

  constructor() {}
}
