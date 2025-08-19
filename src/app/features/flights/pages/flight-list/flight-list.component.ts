import { Component, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { AccordionModule } from 'primeng/accordion';
import { Checkbox } from 'primeng/checkbox';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { MessageService } from 'primeng/api';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { NgxPrintModule } from 'ngx-print';
import { animate, style, transition, trigger } from '@angular/animations';
import { InputNumberModule } from 'primeng/inputnumber';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import airlineLogos from 'airlogos';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-flight-list',
  imports: [CommonModule, AccordionModule, AvatarModule, BadgeModule, DrawerModule, Checkbox, ButtonModule, RadioButtonModule, FormsModule, ReactiveFormsModule, SelectModule, ToastModule, AutoCompleteModule, DatePickerModule, NgClickOutsideDirective, TabsModule, TooltipModule, DialogModule, NgxPrintModule, TabsModule, InputNumberModule],
  animations: [trigger('dropdownAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]), transition(':leave', [animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))])])],
  templateUrl: './flight-list.component.html',
  styleUrl: './flight-list.component.scss',
  providers: [MessageService],
})
export class FlightListComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  user = this.authService.user;
  airLogos;

  private airportListSubject: Subject<string> = new Subject();

  @ViewChildren('originAuto') originAutoCompleteList!: QueryList<any>;
  @ViewChildren('returnAuto') returnAutoCompleteList!: QueryList<any>;
  @ViewChildren('originDatepicker') originDatepickerList!: QueryList<any>;
  @ViewChildren('returnDatepicker') returnDatepickerList!: QueryList<any>;
  @ViewChildren('filterCheckbox') checkboxElements!: QueryList<ElementRef>;

  searchForm: FormGroup;
  isFilterSticky = false;
  isAllUnchecked = false;
  filter_params = {
    fare_type: ['Refundable', 'Non-Refundable'],
    airlines: [],
    airline_code: [],
    aircraft: [],
    baggage: [],
    onward_flight_stops: [0, 1, 2, 3],
    return_flight_stops: [0, 1, 2, 3],
    onward_depart_time: [{ name: '00:00 To 05:59' }, { name: '06:00 To 11:59' }, { name: '12:00 To 17:59' }, { name: '18:00 To 23:59' }],
    return_depart_time: [{ name: '00:00 To 05:59' }, { name: '06:00 To 11:59' }, { name: '12:00 To 17:59' }, { name: '18:00 To 23:59' }],
    onward_arrival_time: [{ name: '00:00 To 05:59' }, { name: '06:00 To 11:59' }, { name: '12:00 To 17:59' }, { name: '18:00 To 23:59' }],
    return_arrival_time: [{ name: '00:00 To 05:59' }, { name: '06:00 To 11:59' }, { name: '12:00 To 17:59' }, { name: '18:00 To 23:59' }],
    onward_transit_hour: [{ name: '0 To 6 Hour' }, { name: '6 To 12 Hour' }, { name: '12 To 18 Hour' }, { name: '18 Hour +' }],
    return_transit_hour: [{ name: '0 To 6 Hour' }, { name: '6 To 12 Hour' }, { name: '12 To 18 Hour' }, { name: '18 Hour +' }],
    onward_flying_time: [{ name: '0 To 6 Hour' }, { name: '6 To 12 Hour' }, { name: '12 To 18 Hour' }, { name: '18 Hour +' }],
    return_flying_time: [{ name: '0 To 6 Hour' }, { name: '6 To 12 Hour' }, { name: '12 To 18 Hour' }, { name: '18 Hour +' }],
    onward_layover_airport: [],
    return_layover_airport: [],
    onward_destination_airport: [],
    return_destination_airport: [],
  };
  modify_filter_params = {
    fare_type: [],
    airline_code: [],
    aircraft: [],
    baggage: [],
    onward_flight_stops: [],
    return_flight_stops: [],
    onward_depart_time: [],
    return_depart_time: [],
    onward_arrival_time: [],
    return_arrival_time: [],
    onward_transit_hour: [],
    return_transit_hour: [],
    onward_flying_time: [],
    return_flying_time: [],
    onward_layover_airport: [],
    return_layover_airport: [],
    onward_destination_airport: [],
    return_destination_airport: [],
  };

  shownFlightList = [];
  filteredFlights = [];
  showSkeletonLoading: boolean = false;
  timeoutId = 0;
  skeletonArray = Array(5).fill(0);
  filterActive = 'cheapest';
  earliestFlight: any;
  cheapestFlight: any;
  fastestFlight: any;
  airportList: any = [];
  destinationBackup: any;
  originBackup: any;

  currencyValueChange = '';
  isFilterClicked = false;
  dropdownOpen = false;
  totalTravelars = 1;
  showPaxDropdown = false;
  journeyType = 1;
  isOverlayVisible = false;
  encryptedSearchData = '';
  isSticky = false;
  openIndex: number | null = null;
  imgUrl = '';

  journeyTypes = [
    { label: 'One Way', value: 1 },
    { label: 'Round Trip', value: 2 },
    { label: 'Multi City', value: 3 },
  ];

  classTypes = [{ name: 'Economy' }, { name: 'Premium Economy' }, { name: 'Business' }, { name: 'First Class' }];

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const scrollPosition = window.pageYOffset;
    const stickyThreshold = 200;
    this.isSticky = scrollPosition >= stickyThreshold;
    this.isFilterSticky = scrollPosition >= stickyThreshold;
  }

  ngOnInit() {
    this.airLogos = airlineLogos;
    this.airportListSubject.pipe(debounceTime(1000)).subscribe((event: any) => {
      this.getCityList(event);
    });

    this.searchForm = this.fb.group({
      journeyType: [1],
      segments: this.fb.array([this.createSegmentGroup(0)]),
      classType: [this.classTypes[0], Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.min(0)]],
      kids: [0, [Validators.min(0)]],
      infants: [0, [Validators.min(0)]],
      carriersCode: '',
    });
  }

  getAirportName(fullName: string): string {
    return fullName?.split(',')[0];
  }

  getAirportName2(fullName: string): string {
    return fullName?.split(',')[1];
  }

  selectedFlight: any;
  toggleFlightDetail(index: number, selectedFlight) {
    this.selectedFlight = selectedFlight;
    console.log(this.selectedFlight);
    this.openIndex = this.openIndex === index ? null : index;
  }

  buildSegmentArray(segments: any[]): FormGroup[] {
    const formArray = segments.map((segment) =>
      this.fb.group({
        origin: [segment.origin, Validators.required],
        destination: [segment.destination, Validators.required],
        departureDate: [segment.departureDate ? new Date(segment.departureDate) : null, Validators.required],
        returnDate: [segment.returnDate ? new Date(segment.returnDate) : null, Validators.required],
        uiState: this.fb.group({
          showOrigin: [segment.uiState?.showOrigin || false],
          showDestination: [segment.uiState?.showDestination || false],
          showDeparture: [segment.uiState?.showDeparture || false],
          showReturn: [segment.uiState?.showReturn || false],
        }),
      }),
    );

    return formArray;
  }

  constructor(private fb: FormBuilder) {}

  get segmentsLength(): number {
    return this.segments.length;
  }

  selectClassType(type: any) {
    this.searchForm.patchValue({ classType: type });
    this.dropdownOpen = false;
  }

  createSegmentGroup(index: number): FormGroup {
    const isEven = index % 2 === 0;

    const origin = isEven ? { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport' } : { code: 'CGP', city: 'Chittagong', name: 'Patenga Airport' };

    const destination = isEven ? { code: 'CGP', city: 'Chittagong', name: 'Patenga Airport' } : { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport' };

    const today = new Date();
    const departureDate = new Date(today.setDate(today.getDate() + index * 2));
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 2);

    return this.fb.group({
      origin: [origin, Validators.required],
      destination: [destination, Validators.required],
      departureDate: [departureDate, Validators.required],
      returnDate: [returnDate, Validators.required],
      uiState: this.fb.group({
        showOrigin: [false],
        showDestination: [false],
        showDeparture: [false],
        showReturn: [false],
      }),
    });
  }

  toggleDropdown(index: number, type: 'showOrigin' | 'showDestination' | 'showDeparture' | 'showReturn') {
    const uiState = this.segments.at(index).get('uiState') as FormGroup;
    const currentValue = uiState.get(type)?.value;
    uiState.get(type)?.setValue(!currentValue);

    setTimeout(() => {
      if (type === 'showOrigin') this.focusOriginAuto(index);
      else if (type === 'showDestination') this.focusReturnAuto(index);
      else if (type === 'showDeparture') this.focusOriginDatepicker(index);
      else if (type === 'showReturn') this.focusReturnDatepicker(index);
    }, 100);
  }

  toggleClassDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get segments(): FormArray {
    return this.searchForm.get('segments') as FormArray;
  }

  onJourneyTypeChange(type: number) {
    this.searchForm.get('journeyType')?.setValue(type);

    if (type === 1 || type === 2) {
      while (this.segments.length > 1) {
        this.segments.removeAt(this.segments.length - 1);
      }
      this.searchForm.get('returnDate')?.setValue('');
    } else if (type === 3) {
      if (this.segments.length < 2) {
        this.segments.push(this.createSegmentGroup(this.segmentsLength));
      }
    }
  }

  addSegment() {
    this.segments.push(this.createSegmentGroup(this.segmentsLength));
  }

  removeSegment(index: number) {
    if (this.segments.length > 1) {
      this.segments.removeAt(index);
    }

    if (this.segmentsLength === 1) {
      this.searchForm.get('journeyType')?.setValue(1);
    }
  }

  focusOriginAuto(index: number) {
    const component = this.originAutoCompleteList.toArray()[index];
    if (component?.inputEL?.nativeElement) {
      component.inputEL.nativeElement.focus();
    }
  }

  focusReturnAuto(index: number) {
    const component = this.returnAutoCompleteList.toArray()[index];
    if (component?.inputEL?.nativeElement) {
      component.inputEL.nativeElement.focus();
    }
  }

  focusOriginDatepicker(index: number) {
    const component = this.originDatepickerList.find((c: any) => {
      return c.el.nativeElement?.getAttribute('data-index') == index.toString();
    });

    if (component?.inputfieldViewChild?.nativeElement) {
      component.inputfieldViewChild.nativeElement.focus();
      component.showOverlay?.();
    }
  }

  focusReturnDatepicker(index: number) {
    const component = this.returnDatepickerList.find((c: any) => {
      return c.el.nativeElement?.getAttribute('data-index') == index.toString();
    });

    if (component?.inputfieldViewChild?.nativeElement) {
      component.inputfieldViewChild.nativeElement.focus();
      component.showOverlay?.(); // Optional: open calendar
    }
  }

  searchCity(event: string) {
    this.airportListSubject.next(event);
  }

  getCityList(searchString: string) {
    this.authService.getAirports(searchString).subscribe((data: any) => {
      this.airportList = data.map((item: any) => {
        const [airportName, city] = item.SearchString.split(',');
        return {
          name: airportName,
          city,
          code: item.AirportCode,
        };
      });
    });
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  get adults() {
    return this.searchForm?.get('adults')?.value;
  }
  set adults(value: number) {
    this.searchForm.get('adults')?.setValue(value);
  }

  get children() {
    return this.searchForm.get('children')?.value;
  }
  set children(value: number) {
    this.searchForm.get('children')?.setValue(value);
  }

  get kids() {
    return this.searchForm.get('kids')?.value;
  }
  set kids(value: number) {
    this.searchForm.get('kids')?.setValue(value);
  }

  get infants() {
    return this.searchForm.get('infants')?.value;
  }

  set infants(value: number) {
    this.searchForm.get('infants')?.setValue(value);
  }

  adultMinus() {
    if (this.adults > 1) {
      this.adults = this.adults - 1;
    } else {
      this.showMessage('error', 'Cannot Remove Passenger', 'At least 1 adult is needed for the booking.');
    }
    this.adjustPassenger();
  }

  adultPlus() {
    if (this.adults + this.children + this.kids + 1 < 10) {
      // Total passenger limit check
      this.adults = this.adults + 1;
    } else {
      this.showMessage('error', 'Cannot Add Passenger', 'Maximum 9 passengers allowed (excluding infants).');
    }
    this.adjustPassenger();
  }

  childrenMinus() {
    if (this.children > 0) {
      this.children = this.children - 1;
    }
    this.adjustPassenger();
  }

  childrenPlus() {
    if (this.adults + this.children + this.kids + 1 < 10) {
      this.children = this.children + 1;
    } else {
      this.showMessage('error', 'Cannot Add Passenger', 'Maximum 9 passengers allowed (excluding infants).');
    }
    this.adjustPassenger();
  }

  kidsMinus() {
    if (this.kids > 0) {
      this.kids = this.kids - 1;
    }
    this.adjustPassenger();
  }

  kidsPlus() {
    if (this.adults + this.children + this.kids + 1 < 10) {
      this.kids = this.kids + 1;
    } else {
      this.showMessage('error', 'Cannot Add Passenger', 'Maximum 9 passengers allowed (excluding infants).');
    }
    this.adjustPassenger();
  }

  infantsMinus() {
    if (this.infants > 0) {
      this.infants = this.infants - 1;
    }
    this.adjustPassenger();
  }

  infantsPlus() {
    if (this.infants + 1 <= this.adults) {
      this.infants = this.infants + 1;
    } else {
      this.showMessage('error', 'Cannot Add Passenger', 'The number of infants cannot exceed the number of adults.');
    }
    this.adjustPassenger();
  }

  adjustPassenger() {
    const adjustedChildren = Math.min(this.children, this.adults * 2);
    const adjustedInfants = Math.min(this.infants, this.adults);
    const adjustedKids = Math.min(this.kids, this.adults);

    // Set adjusted values back to form controls if needed:
    if (adjustedChildren !== this.children) this.children = adjustedChildren;
    if (adjustedInfants !== this.infants) this.infants = adjustedInfants;
    if (adjustedKids !== this.kids) this.kids = adjustedKids;

    this.totalTravelars = this.adults + this.children + this.infants + this.kids;
  }

  toggleShowPaxDropdown() {
    this.showPaxDropdown = !this.showPaxDropdown;
  }

  onInputChange(event: KeyboardEvent) {
    const control = this.searchForm.get('carriersCode');
    let carriersCode = control?.value || '';

    const count = (str: string) => str.split('/').length - 1;

    if (carriersCode.length === 4 && event.key === '/') {
      carriersCode = carriersCode.slice(0, 2) + carriersCode.slice(3);
    }

    if (carriersCode.length === 7 && event.key === '/') {
      carriersCode = carriersCode.slice(0, 5) + carriersCode.slice(6);
    }

    if (carriersCode.length === 10 && event.key === '/') {
      carriersCode = carriersCode.slice(0, 8) + carriersCode.slice(9);
    }

    if (carriersCode.length === 3 && count(carriersCode) === 0) {
      carriersCode = carriersCode.slice(0, 2) + '/' + carriersCode.slice(2);
    }

    if (carriersCode.length === 6 && count(carriersCode) === 1) {
      carriersCode = carriersCode.slice(0, 5) + '/' + carriersCode.slice(5);
    }

    if (carriersCode.length === 9 && count(carriersCode) === 2) {
      carriersCode = carriersCode.slice(0, 8) + '/' + carriersCode.slice(8);
    }

    if (event.key !== '/' && [2, 5, 8].includes(carriersCode.length) && event.key !== 'Backspace') {
      carriersCode += '/';
    }

    control?.setValue(carriersCode, { emitEvent: false });
  }

  formatDateToYMD(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  searchFlight() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const inputFlightData = this.searchForm.value;

    const transformFlightData = (data: any) => {
      const segment = data.segments?.[0] || {};
      console.log(segment);
      return {
        journeyType: data.journeyType,
        origin: segment.origin?.code || '',
        destination: segment.destination?.code || '',
        departureDate: this.formatDateToYMD(segment.departureDate),
        returnDate: this.formatDateToYMD(segment.returnDate),
        classType: data.classType?.name || '',
        noOfInfant: data.infants || 0,
        noOfChildren: data.children || 0,
        noOfAdult: data.adults || 0,
        childrenAges: data.childrenAges || [],
      };
    };

    // Prepare request model
    const requestModel = transformFlightData(inputFlightData);

    // Call the API
    this.showSkeletonLoading = true;
    this.authService?.searchFlights(requestModel, this.searchForm.value?.journeyType).subscribe(
      (res) => {
        this.showSkeletonLoading = false;
        if (res.status) {
          this.originalFlightList = res.payload?.results;
          this.flightList = this.originalFlightList;
          this.filterAfterFetch(this.originalFlightList);
          this.sortFlightList('cheapest');
        } else {
          this.originalFlightList = [];
          this.flightList = [];
          this.showMessage('error', 'Flight Search Failed', '');
        }
        console.log(res);
      },
      (err) => {
        this.showSkeletonLoading = false;
        this.originalFlightList = [];
        this.flightList = [];
        this.showMessage('error', 'Flight Search Failed', '');
      },
    );
  }

  apiDateToString(apiDate: string | Date | null) {
    if (apiDate) {
      const date = new Date(apiDate);
      const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      return dateString;
    }
    return null;
  }

  onTriggerClick(event: MouseEvent, i: number, type: 'showOrigin' | 'showDestination' | 'showDeparture' | 'showReturn'): void {
    event.stopPropagation();
    this.toggleDropdown(i, type);

    const segment = this.segments.at(i);

    if (type === 'showDestination') {
      this.destinationBackup = segment.get('destination')?.value;
    } else if (type === 'showOrigin') {
      this.originBackup = segment.get('origin')?.value;
    }
  }

  stopEventPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  onClickedOutside(segment: AbstractControl, type: 'showOrigin' | 'showDestination' | 'showDeparture' | 'showReturn'): void {
    const uiState = segment.get('uiState') as FormGroup;

    if (type === 'showDestination') {
      const destinationValue = segment.get('destination')?.value;
      const isEmpty = !destinationValue || (!destinationValue.code && !destinationValue.city && !destinationValue.name);

      if (isEmpty && this.destinationBackup) {
        segment.get('destination')?.setValue(this.destinationBackup);
      }
    } else if (type === 'showOrigin') {
      const originValue = segment.get('origin')?.value;
      const isEmpty = !originValue || (!originValue.code && !originValue.city && !originValue.name);

      if (isEmpty && this.originBackup) {
        segment.get('origin')?.setValue(this.originBackup);
      }
    }

    uiState?.get(type)?.setValue(false);
  }

  modifySearch() {
    this.isOverlayVisible = true;
  }

  ///// OLD CODES

  paginatedFlightList = [];
  flightList = [];
  originalFlightList;

  getTimeRange(timeString: string) {
    const ranges: any = {
      '00:00 To 05:59': { startTime: 0, endTime: 5 },
      '06:00 To 11:59': { startTime: 6, endTime: 11 },
      '12:00 To 17:59': { startTime: 12, endTime: 17 },
      '18:00 To 23:59': { startTime: 18, endTime: 23 },
      '0 To 6 Hour': { startTime: 0, endTime: 5 },
      '6 To 12 Hour': { startTime: 6, endTime: 11 },
      '12 To 18 Hour': { startTime: 12, endTime: 17 },
      '18 Hour +': { startTime: 18, endTime: 100 },
    };
    const defaultRange = { startTime: 0, endTime: 23 };
    const selectedRange = ranges[timeString];
    return selectedRange || defaultRange;
  }

  getRangeFromTime(hour: any, isTransit = false) {
    if (hour >= 0 && hour <= 5) {
      return isTransit ? '0 To 6 Hour' : '00:00 To 05:59';
    } else if (hour >= 6 && hour <= 11) {
      return isTransit ? '6 To 12 Hour' : '06:00 To 11:59';
    } else if (hour >= 12 && hour <= 17) {
      return isTransit ? '12 To 18 Hour' : '12:00 To 17:59';
    } else if (hour >= 18 && hour <= 23) {
      return isTransit ? '18 Hour +' : '18:00 To 23:59';
    } else if (hour >= 24 && hour <= 100) {
      return '18 Hour +';
    } else {
      return '00:00';
    }
  }

  makeDeepClone(object: any) {
    return JSON.parse(JSON.stringify(object));
  }

  filterAfterFetch(currentFlights: any) {
    this.currencyValueChange = 'BDT';
    this.filter_params.airlines.forEach((a: any) => (a.Count = 0));

    const sortedList = [...currentFlights]
      .sort((a, b) => parseFloat(a.TotalPrice) - parseFloat(b.TotalPrice))
      .map((flight) => ({
        Carrier: flight.PlatingCarrier,
        AirLines: `${flight.PlatingCarrierName} (${flight.PlatingCarrier})`,
        Name: flight.PlatingCarrierName,
        Stop: flight.TotalTravelTimes[0].NoOfStop,
        Price: parseFloat(flight.TotalPrice),
        TotalServiceCharge: flight.TotalServiceCharge,
        Count: 0,
        checked: false,
      }));

    const airlineExists = new Set();

    for (const flight of sortedList) {
      const carrierCode = flight.Carrier;

      if (!airlineExists.has(carrierCode)) {
        airlineExists.add(carrierCode);

        const existingAirline: any = this.filter_params.airlines.find((a: any) => a.AirLines === flight.AirLines);

        if (!existingAirline) {
          this.filter_params.airlines.push(flight);
          this.filter_params.airline_code.push(carrierCode);
        } else if (flight.Price < existingAirline.Price) {
          existingAirline.Price = flight.Price;
        }
      }
    }

    [...currentFlights]
      .sort((a, b) => parseFloat(a.TotalPrice) - parseFloat(b.TotalPrice))
      .forEach((p) => {
        const name = p.PlatingCarrier;
        const exist: any = this.filter_params.airlines.find((a: any, i) => a.Carrier === name);
        if (exist) {
          exist.Count++;
        }
      });

    this.filter_params.aircraft = currentFlights.map((data) => data.onwardFlights.flat()[0].operatingFlightNumber).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);

    this.filter_params.baggage = currentFlights.map((data) => data.onwardFlights.flat()[0].baggageAllowance).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);

    if (this.journeyType != 3) {
      for (let i = 0; i < currentFlights.length; i++) {
        const singleListData: any = currentFlights[i];
        const length_onward = singleListData.onwardFlights.length;
        const length_return = singleListData.onwardFlights.length;
        if (length_onward > 1) {
          for (let j = 0; j < length_onward; j++) {
            if (j !== length_onward - 1) {
              if (!this.filter_params.onward_layover_airport.includes(singleListData.onwardFlights[j].destinationAirportName)) {
                this.filter_params.onward_layover_airport.push(singleListData.onwardFlights[j].destinationAirportName);
              }
              if (!this.filter_params.onward_destination_airport.includes(singleListData.onwardFlights[length_onward - 1].destinationAirportName)) {
                this.filter_params.onward_destination_airport.push(singleListData.onwardFlights[length_onward - 1].destinationAirportName);
              }
            }
          }
        }
        if (length_return > 1) {
          for (let j = 0; j < length_return; j++) {
            if (j !== length_return - 1) {
              if (!this.filter_params.return_layover_airport.includes(singleListData.returnFlights[j].destinationAirportName)) {
                this.filter_params.return_layover_airport.push(singleListData.returnFlights[j].destinationAirportName);
              }
              if (!this.filter_params.return_destination_airport.includes(singleListData.returnFlights[length_return - 1].destinationAirportName)) {
                this.filter_params.return_destination_airport.push(singleListData.returnFlights[length_return - 1].destinationAirportName);
              }
            }
          }
        }
      }
    }
  }

  //  Must need arrow function here
  compareDepartureTime = (flightA: any, flightB: any) => {
    const a = this.journeyType == 3 ? flightA.onwardFlights[0][0].departureTime : flightA.onwardFlights[0].departureTime;
    const b = this.journeyType == 3 ? flightB.onwardFlights[0][0].departureTime : flightB.onwardFlights[0].departureTime;
    return +new Date(a).getTime() - +new Date(b).getTime();
  };

  //  Must need arrow function here
  compareTotalDuration = (flightA: any, flightB: any) => {
    return this.totalDurationConvertToSeconds(flightA.TotalTravelTimes[0].TotalTravelDuration) - this.totalDurationConvertToSeconds(flightB.TotalTravelTimes[0].TotalTravelDuration);
  };

  compareTotalPrice(flightA: any, flightB: any) {
    return flightA.TotalPrice + flightA.TotalDiscount - (flightB.TotalPrice + flightA.TotalDiscount);
  }

  compareShortTransit(flightA: any, flightB: any) {
    return flightA.TotalTravelTimes.reduce((acc: any, curr: any) => acc + curr.TotalLayoverTime, 0) - flightB.TotalTravelTimes.reduce((acc: any, curr: any) => acc + curr.TotalLayoverTime, 0);
  }

  // Sorting related codes
  sortFlightList(sortBy: string) {
    this.showSkeletonLoading = true;
    setTimeout(() => {
      this.showSkeletonLoading = false;
    }, 500);
    // this.preloaderService.showSpinner();

    this.filterActive = sortBy;

    const compareFunctions = {
      earliest: this.compareDepartureTime,
      cheapest: this.compareTotalPrice,
      fastest: this.compareTotalDuration,
      shortTransit: this.compareShortTransit,
    };

    this.flightList = this.flightList.sort(compareFunctions[sortBy]);
    this.getFilteredFlight(this.flightList);
  }

  getFilteredFlight(tempFlightList: any) {
    const getEarliestFlight = (flightA: any, flightB: any) => {
      const a = this.journeyType == 3 ? flightA.onwardFlights[0][0]?.departureTime : flightA.onwardFlights[0]?.departureTime;
      const b = this.journeyType == 3 ? flightB.onwardFlights[0][0]?.departureTime : flightB.onwardFlights[0]?.departureTime;
      return +new Date(a).getTime() - +new Date(b).getTime();
    };

    const getFastestFlight = (flightA: any, flightB: any) => this.totalDurationConvertToSeconds(flightA.TotalTravelTimes[0].TotalTravelDuration) - this.totalDurationConvertToSeconds(flightB.TotalTravelTimes[0].TotalTravelDuration);

    const getCheapestFlight = (flightA: any, flightB: any) => flightA.TotalPrice + flightA.TotalDiscount - (flightB.TotalPrice + flightB.TotalDiscount);

    this.earliestFlight = [...tempFlightList].sort(getEarliestFlight).shift();
    this.cheapestFlight = [...tempFlightList].sort(getCheapestFlight).shift();
    this.fastestFlight = [...tempFlightList].sort(getFastestFlight).shift();
  }

  resetAllFilter() {
    this.checkboxElements.forEach((checkbox) => {
      checkbox.nativeElement.checked = false;
    });

    this.emptyAnyArray(this.modify_filter_params);
    this.filter_params.airlines.map((x) => (x.checked = false));
    this.isFilterClicked = false;
    this.flightList = this.originalFlightList;
  }

  emptyAnyArray(filter_params: any) {
    for (const key in filter_params) {
      if (Array.isArray(filter_params[key])) {
        filter_params[key].length = 0;
      }
    }
  }

  flightListFilter(): any {
    let tempList = this.originalFlightList;

    // FARE TYPE FILTER
    if (this.modify_filter_params.fare_type.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.fare_type.some((fareType: string) => {
          const isRefundable = fareType === 'Refundable';
          return isRefundable === currentFlight.IsRefundable;
        });
      });
    }

    // AIRCRAFT FILTER
    if (this.modify_filter_params.aircraft.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.aircraft.some((aircraft: string) => {
          return aircraft === currentFlight.onwardFlights.flat()[0].flightNumber;
        });
      });
    }

    // AIRLINE FILTER
    if (this.modify_filter_params.airline_code.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.airline_code.some((carrierCode: string) => {
          return carrierCode === currentFlight.PlatingCarrier;
        });
      });
    }

    // BAGGAGE FILTER
    if (this.modify_filter_params.baggage.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.baggage.some((baggage: string) => {
          return baggage === currentFlight.onwardFlights.flat()[0].baggageAllowance;
        });
      });
    }

    // ONWARD FLIGHT STOPS FILTER
    if (this.modify_filter_params.onward_flight_stops.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.onward_flight_stops.some((onwardStop: string) => {
          return onwardStop === currentFlight.TotalTravelTimes[0].NoOfStop;
        });
      });
    }

    // RETURN FLIGHT STOPS FILTER
    if (this.modify_filter_params.return_flight_stops.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_flight_stops.some((returnStop: string) => {
          return returnStop === currentFlight.TotalTravelTimes[1].NoOfStop;
        });
      });
    }

    // ONWARD DEPART TIME FILTER
    if (this.modify_filter_params.onward_depart_time.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.onward_depart_time.some((onwardDepartTime: string) => {
          const departTime = new Date(currentFlight.onwardFlights.flat()[0].departureTime).getHours();
          const { startTime, endTime } = this.getTimeRange(onwardDepartTime);
          return departTime >= startTime && departTime <= endTime;
        });
      });
    }

    // RETURN DEPART TIME FILTER
    if (this.modify_filter_params.return_depart_time.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_depart_time.some((returnDepartTime: string) => {
          const departTime = new Date(currentFlight.returnFlights.flat()[0].departureTime).getHours();
          const { startTime, endTime } = this.getTimeRange(returnDepartTime);
          return departTime >= startTime && departTime <= endTime;
        });
      });
    }

    // ONWARD ARRIVAL TIME FILTER
    if (this.modify_filter_params.onward_arrival_time.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.onward_arrival_time.some((onwardArrivalTime: string) => {
          const departTime = new Date(currentFlight.onwardFlights.flat()[currentFlight.onwardFlights.flat().length - 1].arrivalTime).getHours();
          const { startTime, endTime } = this.getTimeRange(onwardArrivalTime);
          return departTime >= startTime && departTime <= endTime;
        });
      });
    }

    // RETURN ARRIVAL TIME FILTER
    if (this.modify_filter_params.return_arrival_time.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_arrival_time.some((returnArrivalTime: string) => {
          const departTime = new Date(currentFlight.returnFlights.flat()[currentFlight.returnFlights.flat().length - 1].arrivalTime).getHours();
          const { startTime, endTime } = this.getTimeRange(returnArrivalTime);
          return departTime >= startTime && departTime <= endTime;
        });
      });
    }

    // ONWARD TRANSIT HOUR FILTER
    if (this.modify_filter_params.onward_transit_hour.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.onward_transit_hour.some((onwardTransitHour: string) => {
          const layoverTime = this.millisecondsToHour(currentFlight.TotalTravelTimes[0].TotalLayoverTime);
          const { startTime, endTime } = this.getTimeRange(onwardTransitHour);
          return layoverTime >= startTime && layoverTime <= endTime;
        });
      });
    }

    // RETURN TRANSIT HOUR FILTER
    if (this.modify_filter_params.return_transit_hour.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_transit_hour.some((returnTransitHour: string) => {
          const layoverTime = this.millisecondsToHour(currentFlight.TotalTravelTimes[1].TotalLayoverTime);
          const { startTime, endTime } = this.getTimeRange(returnTransitHour);
          return layoverTime >= startTime && layoverTime <= endTime;
        });
      });
    }

    // ONWARD FLYING TIME FILTER issus
    if (this.modify_filter_params.onward_flying_time.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.onward_flying_time.some((onwardFlyingTime: string) => {
          const flyingTime = this.millisecondsToHour(currentFlight.TotalTravelTimes[0].TotalTravelDuration);
          const { startTime, endTime } = this.getTimeRange(onwardFlyingTime);
          return flyingTime >= startTime && flyingTime <= endTime;
        });
      });
    }

    // RETURN FLYING TIME FILTER issue
    if (this.modify_filter_params.return_flying_time.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_flying_time.some((returnFlyingTime: string) => {
          const flyingTime = this.millisecondsToHour(currentFlight.TotalTravelTimes[1].TotalTravelDuration);
          const { startTime, endTime } = this.getTimeRange(returnFlyingTime);
          return flyingTime >= startTime && flyingTime <= endTime;
        });
      });
    }

    // ONWARD LAYOVER AIRPORT FILTER
    if (this.modify_filter_params.onward_layover_airport.length) {
      tempList = tempList.filter((currentFlight): any => {
        return this.modify_filter_params.onward_layover_airport.some((onwardLayoverAirport): any => {
          return currentFlight.onwardFlights.flat().some((onward, i: number): any => {
            if (i !== currentFlight.onwardFlights.flat().length - 1) {
              return onward.destinationAirportName === onwardLayoverAirport;
            }
          });
        });
      });
    }

    // RETURN LAYOVER AIRPORT FILTER
    if (this.modify_filter_params.return_layover_airport.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_layover_airport.some((returnLayoverAirport) => {
          return currentFlight.returnFlights.flat().some((returns, i: number): any => {
            if (i !== currentFlight.returnFlights.flat().length - 1) {
              return returns.destinationAirportName === returnLayoverAirport;
            }
          });
        });
      });
    }

    // ONWARD DESTINATION AIRPORT FILTER
    if (this.modify_filter_params.onward_destination_airport.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.onward_destination_airport.some((onwardDestAirport: string) => {
          return onwardDestAirport === currentFlight.onwardFlights.flat()[currentFlight.onwardFlights.flat().length - 1].destinationAirportName;
        });
      });
    }

    // RETURN DESTINATION AIRPORT FILTER
    if (this.modify_filter_params.return_destination_airport.length) {
      tempList = tempList.filter((currentFlight) => {
        return this.modify_filter_params.return_destination_airport.some((returnDestAirport: string) => {
          return returnDestAirport === currentFlight.returnFlights.flat()[currentFlight.returnFlights.flat().length - 1].destinationAirportName;
        });
      });
    }

    this.flightList = tempList;
    // this.shownFlightList = tempList;

    console.log(this.flightList);

    this.isFilterClicked = Object.values(this.modify_filter_params).some((x: any) => x.length);
  }
  resetFilter(currentFilter: string) {
    this.modify_filter_params[currentFilter] = [];
    const checkboxes = document.getElementsByClassName(currentFilter) as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
  }

  newOnFilterChange(event, value: any, currentFilter: string) {
    this.showSkeletonLoading = true;
    setTimeout(() => {
      this.showSkeletonLoading = false;
    }, 500);
    // this.preloaderService.showSpinner();
    const isChecked = event.target?.checked;
    const filterArray = this.modify_filter_params[currentFilter];
    isChecked ? !filterArray.includes(value) && filterArray.push(value) : filterArray.splice(filterArray.indexOf(value), 1);
    if (currentFilter === 'airline_code') {
      const airline = this.filter_params.airlines.find((x) => x.Carrier === value);
      airline.checked = isChecked;
    }

    this.flightListFilter();
  }

  newShowParticularAirline(val: any) {
    const data = this.modify_filter_params.airline_code.find((x) => x === val);
    if (data === undefined) {
      this.modify_filter_params.airline_code.push(val);
      const index = this.filter_params.airlines.findIndex((x) => x.Carrier === val);
      this.filter_params.airlines[index].checked = true;
    } else {
      this.modify_filter_params.airline_code.splice(
        this.modify_filter_params.airline_code.findIndex((x) => x === val),
        1,
      );
      const index = this.filter_params.airlines.findIndex((x) => x.Carrier === val);
      this.filter_params.airlines[index].checked = false;
    }
  }

  totalDurationConvertToSeconds(time: any) {
    let arr = time.split(' ');
    let day_arr;
    let hour_arr;
    let min_arr;
    let seconds;
    if (arr.length == 3) {
      day_arr = arr[0].split('d');
      hour_arr = arr[1].split('h');
      min_arr = arr[2].split('m');
      seconds = day_arr[0] * 24 * 3600 + hour_arr[0] * 3600 + min_arr[0] * 60;
    } else if (arr.length == 2) {
      hour_arr = arr[0].split('h');
      min_arr = arr[1].split('m');
      seconds = hour_arr[0] * 3600 + min_arr[0] * 60;
    } else if (arr.length == 1) {
      min_arr = arr[0].split('m');
      seconds = min_arr[0] * 60;
    }
    return seconds;
  }

  totalDurationConvert(time: any) {
    const arr = time.split(' ');
    let day_arr;
    let hour_arr;
    let min_arr;
    let seconds = 0;
    if (arr.length === 3) {
      day_arr = arr[0].split('d');
      hour_arr = arr[1].split('h');
      min_arr = arr[2].split('m');
      seconds = day_arr[0] * 24 * 3600 + hour_arr[0] * 3600 + min_arr[0] * 60;
    } else if (arr.length === 2) {
      hour_arr = arr[0].split('h');
      min_arr = arr[1].split('m');
      seconds = hour_arr[0] * 3600 + min_arr[0] * 60;
    } else if (arr.length === 1) {
      min_arr = arr[0].split('m');
      seconds = min_arr[0] * 60;
    }
    const hours = Math.floor(seconds / 60 / 60);
    return hours;
  }

  getTotalHour(value: any) {
    const departTime = new Date(value).getHours();
    return departTime;
  }

  millisecondsToHour(value: any) {
    const milliSeconds = parseInt(value, 10);
    const hour = Math.floor(milliSeconds / 3600 / 1000);
    return hour;
  }

  millisecondsToDayHourMin(value: any) {
    let milliSeconds = parseInt(value, 10);
    const days = Math.floor(milliSeconds / (86400 * 1000));
    milliSeconds -= days * (86400 * 1000);
    const hours = Math.floor(milliSeconds / (60 * 60 * 1000));
    milliSeconds -= hours * (60 * 60 * 1000);
    const minutes = Math.floor(milliSeconds / (60 * 1000));
    const dDisplay = days > 0 ? days + (days === 1 ? 'd ' : 'd ') : '';
    const hDisplay = hours > 0 ? hours + (hours === 1 ? 'h ' : 'h ') : '';
    const mDisplay = minutes > 0 ? minutes + (minutes === 1 ? 'm ' : 'm ') : '';
    return dDisplay + hDisplay + mDisplay;
  }

  isAddedToCart: boolean = false;

  addToCart() {
    this.isAddedToCart = true;
    // Optionally trigger service/cart logic here
  }

  selectedTab: 'outbound' | 'return' = 'outbound';
  isViewDetailsShow = false;

  viewFlightDetails() {
    this.isViewDetailsShow = !this.isViewDetailsShow;
  }

  quotationSelected: boolean[] = [];
  isShowItineraryModal = false;

  selectedItinerary: any;
  showItineraryModal(selectedItinerary: any) {
    this.isShowItineraryModal = true;
    this.selectedItinerary = selectedItinerary;

    console.log(this.selectedItinerary);
  }

  sendEmail() {
    this.showMessage('error', 'Reset Failed', `We couldn’t send the reset email. Please ensure that the email settings are properly configured.`);
  }

  isShowFare = true;
  toggleFareInfo() {
    this.isShowFare = !this.isShowFare;
  }

  recalculateTotalFare(index: number) {
    const item = this.selectedItinerary.FareBreakdown[index];
    const base = Number(item.BaseFare) || 0;
    const tax = Number(item.TotalTax) || 0;
    const discount = Number(item.ApiDiscount) || 0;
    const passengerCount = Number(item.NoOfPassenger) || 1;

    item.TotalFare = (base + tax - discount) * passengerCount;
  }

  isEditMode = false;
  isShowEditButton = true;

  getTotalPrice(): number {
    if (!this.selectedItinerary?.FareBreakdown) return 0;

    return this.selectedItinerary.FareBreakdown.reduce((sum, item) => sum + (Number(item.TotalFare) || 0), 0);
  }

  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }

  @ViewChild('printBtn') printBtn!: ElementRef<HTMLButtonElement>;

  printTicket() {
    this.isEditMode = false;
    this.isShowEditButton = false;
    setTimeout(() => {
      this.printBtn.nativeElement.click();
      this.isShowEditButton = true;
    }, 100);
  }
}
