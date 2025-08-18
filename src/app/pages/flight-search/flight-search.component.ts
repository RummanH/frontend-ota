import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, PrimeIcons } from 'primeng/api';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { debounceTime, Subject } from 'rxjs';
import { AuthService, FlightSearchModel } from '../../layout/service/auth.service';
import { ToastModule } from 'primeng/toast';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { EncrDecrService } from '../../layout/service/encr-decr.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
    selector: 'app-flight-search',
    imports: [ButtonModule, ButtonModule, RadioButtonModule, CommonModule, FormsModule, ReactiveFormsModule, SelectModule, ToastModule, AutoCompleteModule, DatePickerModule, NgClickOutsideDirective],
    templateUrl: './flight-search.component.html',
    styleUrl: './flight-search.component.scss',
    providers: [MessageService]
})
export class FlightSearchComponent {
    searchForm: FormGroup;
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private encrDecr = inject(EncrDecrService);
    private router = inject(Router);

    @ViewChildren('originAuto') originAutoCompleteList!: QueryList<any>;
    @ViewChildren('returnAuto') returnAutoCompleteList!: QueryList<any>;
    @ViewChildren('originDatepicker') originDatepickerList!: QueryList<any>;
    @ViewChildren('returnDatepicker') returnDatepickerList!: QueryList<any>;

    journeyTypes = [
        { label: 'One Way', value: 1 },
        { label: 'Round Trip', value: 2 },
        { label: 'Multi City', value: 3 }
    ];

    classTypes = [{ name: 'Economy' }, { name: 'Premium Economy' }, { name: 'Business' }, { name: 'First Class' }];

    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            journeyType: [1],
            segments: this.fb.array([this.createSegmentGroup(0)]),
            classType: [this.classTypes[0], Validators.required],
            adults: [1, [Validators.required, Validators.min(1)]],
            children: [0, [Validators.min(0)]],
            kids: [0, [Validators.min(0)]],
            infants: [0, [Validators.min(0)]],
            carriersCode: ''
        });
    }

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
                showReturn: [false]
            })
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

    // Usage

    // swap() {
    //     const from = this.form.get('from')?.value;
    //     const to = this.form.get('to')?.value;
    //     this.form.patchValue({ from: to, to: from });
    // }

    selectedOrigin: any = {
        code: 'DAC',
        city: 'Dhaka',
        name: 'Hazrat Shahjalal International Airport'
    };

    selectedDestination: any = {
        code: 'CGP',
        city: 'Chittagong',
        name: 'Patenga Airport'
    };

    isShowOrigin = false;
    showOriginDropdown() {
        this.isShowOrigin = !this.isShowOrigin;

        // setTimeout(() => {
        //     if (this.originAutocomplete && this.originAutocomplete.inputEL?.nativeElement) {
        //         this.originAutocomplete.inputEL.nativeElement.focus();
        //     }
        // });
    }

    private airportListSubject: Subject<string> = new Subject();

    ngOnInit(): void {
        this.airportListSubject.pipe(debounceTime(1000)).subscribe((event) => {
            this.getCityList(event);
        });
    }

    searchCity(event: string) {
        this.airportListSubject.next(event);
    }

    airportList: any = [];
    getCityList(searchString: string) {
        this.authService.getAirports(searchString).subscribe((data: any) => {
            this.airportList = data.map((item: any) => {
                const [airportName, city] = item.SearchString.split(',');
                return {
                    name: airportName,
                    city,
                    code: item.AirportCode
                };
            });
        });
    }

    isShowDestination = false;

    classType: any = this.classTypes[0];
    journeyType = 2;
    selectTripType(journeyType: number) {
        this.journeyType = journeyType;
    }

    dropdownOpen = false;

    totalTravelars = 1;

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

    showPaxDropdown = false;
    toggleShowPaxDropdown() {
        this.showPaxDropdown = !this.showPaxDropdown;
    }

    showDepartureDate = false;
    showReturnDate = false;

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

    searchFlight() {
        if (this.searchForm.invalid) {
            this.searchForm.markAllAsTouched();
            return;
        }

        const formValues = this.searchForm.value;

        const encryptedSearchData = this.encrDecr.setString(environment.encryptionKey, JSON.stringify(formValues));
        this.router.navigate(['/pages/flight-list'], { state: { encryptedSearchData } });
    }

    apiDateToString(apiDate: string | Date | null) {
        if (apiDate) {
            const date = new Date(apiDate);
            const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            return dateString;
        }
        return null;
    }

    destinationBackup: any;
    originBackup: any;

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
}
