import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { NgxPrintModule } from 'ngx-print';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButton, RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import _ from 'lodash';
import { AuthService } from '../../../layout/service/auth.service';
import { AllApiService } from '../../../layout/service/all-api.service';
import { TicketService } from '../../../layout/service/ticket.service';
import { TicketOneComponent } from './views/ticket-one/ticket-one.component';
import { TicketTwoComponent } from './views/ticket-two/ticket-two.component';
import { previewTicketData } from '../../../contstants';
import { StepperModule } from 'primeng/stepper';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { Tooltip } from 'primeng/tooltip';
import { PreloaderService } from '../../../layout/service/preloader.service';
import { Message } from 'primeng/message';
import { EncrDecrService } from '../../../layout/service/encr-decr.service';
import { v4 as uuidv4 } from 'uuid';
import { debounceTime, Subject } from 'rxjs';
import { AutoComplete } from 'primeng/autocomplete';
import { DragDropModule } from 'primeng/dragdrop';
import { DatePicker } from 'primeng/datepicker';
import { environment } from '../../../../environments/environment';
import { TicketThreeComponent } from './views/ticket-three/ticket-three.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import airlineLogos from 'airlogos';
export interface AirSegmentRequest {
  Id: number;
  CarrierCode: string;
  FlightNumber: string;
  Origin: string;
  Destination: string;
  DepartureDate: string | Date | null;
  ArrivalDate: string | Date | null;
  ConfirmationNo: string;
  DepartureTerminal: string;
  ArrivalTerminal: string;
  CabinClass: string;
  AirCraft: string;
  BookingClass: string;
  AirBaggageAllowance: string;
  CabinBaggageAllowance: number;
  CabinTypeName: string;
  SegmentType: string;
}

@Component({
  selector: 'app-ticket',
  imports: [
    NgxPrintModule,
    CommonModule,
    TableModule,
    FormsModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    TicketOneComponent,
    TicketTwoComponent,
    TicketThreeComponent,
    StepperModule,
    ButtonModule,
    Checkbox,
    Tooltip,
    InputTextModule,
    Message,
    RadioButton,
    AutoComplete,
    DatePicker,
    DragDropModule,
  ],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class TicketComponent implements OnInit {
  private ticketService = inject(TicketService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private allApi = inject(AllApiService);
  private preloaderService = inject(PreloaderService);
  private confirmationService = inject(ConfirmationService);
  private encrDecr = inject(EncrDecrService);
  private router = inject(Router);

  domesticPlaces = ['DAC', 'CXB', 'CGP', 'ZYL', 'BZL', 'SPD', 'JSR', 'RJH'];
  classTypes = [{ name: 'Economy' }, { name: 'Premium Economy' }, { name: 'Business' }, { name: 'First Class' }];
  isEditedFare = true;
  emailDialog = false;
  emailSubject = '';
  emailAddress = '';
  grandTotalAfterEdit = 0;
  showEditFareDialogue = false;
  isShowFare = true;
  editPriceModel: any = [];
  priceType = ['Flat', 'Percent'];
  fareType = 'Flat';
  pnrNumber: string | null = '';
  template: string | null = '';
  viewMode: string | null = '';
  encryptedPaxKey: string | null = '';
  showExtraServiceDialogue = false;
  extraServices: any = [];
  currentStep = 1;
  isDomestic = false;
  showSplitTicketModal = false;
  hadExtraService = false;
  ticketType: null | string = '';
  imgUrl: string = '';

  ticketData: any;
  isChildrenMultiFare = false;
  childFares: any = [];
  private sanitizer = inject(DomSanitizer);
  airLogos;

  getMax(): number | undefined {
    return this.fareType === 'Percent' ? 100 : undefined;
  }

  getBaggageData() {
    this.ticketService.setBaggageData(
      this.ticketData?.TravelDetials?.OnwardSegmentList?.map((x: any) => {
        const baggageInfos = x.BaggageInfos || [];

        const seen = new Set<string>();
        const uniqueBaggage = baggageInfos.filter((item: any) => {
          const baggageKey = (item.Baggage || '').trim().toUpperCase();
          if (seen.has(baggageKey)) return false;
          seen.add(baggageKey);
          return true;
        });

        return {
          Origin: x.OriginName,
          Destination: x.DestinationName,
          BaggageList: uniqueBaggage,
          CabinBaggage: x.CabinBaggage,
        };
      }),
    );
  }

  get dialogHeader(): string {
    switch (this.currentStep) {
      case 1:
        return 'Add Wheel Chair Service';
      case 2:
        return 'Add Baggage Service';
      case 3:
        return 'Add Meal Service';
      case 4:
        return 'Add Seat Service';
      default:
        return 'Add Extra Service';
    }
  }

  prepareExtraService() {
    this.extraServices = [];
    const actualOnwards = this.ticketData.TravelDetials?.OnwardSegmentList.filter((x: any) => !x.IsManualEntry);
    const actualReturns = this.ticketData.TravelDetials?.ReturnSegmentList?.filter((x: any) => !x.IsManualEntry);

    this.ticketData?.Paxlist?.forEach((p: any) => {
      let passengerObject: any = {
        PassengerId: p.PassengerId,
        PassengerName: p.PassengerName,
        TotalBaggagePrice: 0,
        TotalSeatPrice: 0,
        TotalMealPrice: 0,
        TotalWheelchairPrice: 0,
        IsWheelchairIncluded: false,
        IsBaggageIncluded: false,
        IsSeatIncluded: false,
        IsMealIncluded: false,
        ExtraSeat: [],
        ExtraMeal: [],
        ExtraBaggages: [],
      };

      actualOnwards
        .filter((x: any) => !x.IsManualEntry)
        .forEach((o: any) => {
          let extraMeal = {
            AirSegmentId: o.AirSegmentId,
            Trip: o.OriginName + '-' + o.DestinationName,
            MealType: '',
            IsOpen: false,
          };

          let extraSeat = {
            AirSegmentId: o.AirSegmentId,
            Trip: o.OriginName + '-' + o.DestinationName,
            SeatNo: '',
            IsOpen: false,
          };

          passengerObject.ExtraSeat.push(extraSeat);
          passengerObject.ExtraMeal.push(extraMeal);
        });

      actualReturns
        ?.filter((x: any) => !x.IsManualEntry)
        .forEach((o: any) => {
          let extraMeal = {
            AirSegmentId: o.AirSegmentId,
            Trip: o.OriginName + '-' + o.DestinationName,
            MealType: '',
            IsOpen: false,
          };

          let extraSeat = {
            AirSegmentId: o.AirSegmentId,
            Trip: o.OriginName + '-' + o.DestinationName,
            SeatNo: '',
            IsOpen: false,
          };

          passengerObject.ExtraSeat.push(extraSeat);
          passengerObject.ExtraMeal.push(extraMeal);
        });

      if (this.ticketData?.TravelDetials?.JournyType === 'ONE WAY') {
        let extraBaggage = {};
        extraBaggage = {
          AirSegmentId: actualOnwards[0]?.AirSegmentId,
          Trip: actualOnwards[0].OriginName + '-' + actualOnwards[actualOnwards.length - 1].DestinationName,
          BaggageAllowance: '',
          IsOpen: false,
        };
        passengerObject.ExtraBaggages.push(extraBaggage);
      }

      if (this.ticketData?.TravelDetials?.JournyType === 'ROUND TRIP') {
        const onwardTrip = {
          AirSegmentId: actualOnwards[0]?.AirSegmentId,
          Trip: `${actualOnwards[0]?.OriginName} - ${actualOnwards[actualOnwards.length - 1]?.DestinationName}`,
          BaggageAllowance: '',
          IsOpen: false,
        };
        passengerObject.ExtraBaggages.push(onwardTrip);

        if (actualReturns.length) {
          const returnTrip = {
            AirSegmentId: actualReturns[0]?.AirSegmentId,
            Trip: `${actualReturns[0]?.OriginName} - ${actualReturns[actualReturns.length - 1]?.DestinationName}`,
            BaggageAllowance: '',
            IsOpen: false,
          };
          passengerObject.ExtraBaggages.push(returnTrip);
        }
      }

      if (this.ticketData?.TravelDetials?.JournyType === 'MULTI CITY') {
        const segments = actualOnwards || [];
        const routes = this.ticketData.Routes || [];
        routes.forEach((r: any) => {
          const route = segments.find((o: any) => o?.OriginName === r?.Origin && this.apiDateToString(o?.DepartureDate) === r?.DepartureDate);
          if (!route) return;
          passengerObject.ExtraBaggages.push({
            AirSegmentId: route.AirSegmentId,
            Trip: `${r.Origin}-${r.Destination}`,
            BaggageAllowance: '',
            IsOpen: false,
          });
        });
      }

      this.extraServices.push(passengerObject);
    });
  }

  mergeExtraServiceFromApi(apiExtraServices: any[]) {
    if (!apiExtraServices?.length || !this.extraServices?.length) return;

    apiExtraServices.forEach((apiPax: any) => {
      const localPax = this.extraServices.find((p: any) => p.PassengerId === apiPax.PassengerId);
      if (!localPax) return;

      // Basic totals
      localPax.TotalBaggagePrice = apiPax.TotalBaggagePrice || 0;
      localPax.TotalSeatPrice = apiPax.TotalSeatPrice || 0;
      localPax.TotalMealPrice = apiPax.TotalMealPrice || 0;
      localPax.TotalWheelchairPrice = apiPax.TotalWheelchairPrice || 0;

      // Flags
      localPax.IsWheelchairIncluded = apiPax.IsWheelchairIncluded || false;
      localPax.IsBaggageIncluded = apiPax.IsBaggageIncluded || false;
      localPax.IsSeatIncluded = apiPax.IsSeatIncluded || false;
      localPax.IsMealIncluded = apiPax.IsMealIncluded || false;

      // Extra Baggage
      if (apiPax.ExtraBaggages?.length) {
        const allBaggages = [...localPax.ExtraBaggages.map((item: any) => ({ ...item, IsOpen: false })), ...apiPax.ExtraBaggages.map((item: any) => ({ ...item, IsOpen: true }))];

        const uniqueBaggagesMap = new Map<number, any>();

        // Later entries overwrite earlier ones (API takes precedence)
        allBaggages.forEach((item) => {
          uniqueBaggagesMap.set(item.AirSegmentId, item);
        });

        localPax.ExtraBaggages = Array.from(uniqueBaggagesMap.values());
      }

      // Extra Seat
      if (apiPax.ExtraSeat?.length) {
        const allSeats = [...localPax.ExtraSeat.map((item: any) => ({ ...item, IsOpen: false })), ...apiPax.ExtraSeat.map((item: any) => ({ ...item, IsOpen: true }))];

        const uniqueSeatsMap = new Map<number, any>();

        allSeats.forEach((item) => {
          uniqueSeatsMap.set(item.AirSegmentId, item); // API will override local if duplicate
        });

        localPax.ExtraSeat = Array.from(uniqueSeatsMap.values());
      }

      // Extra Meal
      if (apiPax.ExtraMeal?.length) {
        const allMeals = [...localPax.ExtraMeal.map((item: any) => ({ ...item, IsOpen: false })), ...apiPax.ExtraMeal.map((item: any) => ({ ...item, IsOpen: true }))];

        const uniqueMealsMap = new Map<number, any>();

        allMeals.forEach((item) => {
          uniqueMealsMap.set(item.AirSegmentId, item);
        });

        localPax.ExtraMeal = Array.from(uniqueMealsMap.values());
      }
    });
  }

  showExtraServiceModal() {
    this.prepareExtraService();
    this.mergeExtraServiceFromApi(this.ticketData?.ExtraServiceItems?.PassengerExtraServices);
    this.showExtraServiceDialogue = true;
  }

  hideExtraServiceModal() {
    this.showExtraServiceDialogue = false;
  }

  submitExtraService() {
    const originalMap = new Map<number, any>();

    this.ticketData?.ExtraServiceItems?.PassengerExtraServices?.forEach((p: any) => {
      originalMap.set(p.PassengerId, {
        IsSeatIncluded: p.IsSeatIncluded,
        IsMealIncluded: p.IsMealIncluded,
        IsBaggageIncluded: p.IsBaggageIncluded,
        IsWheelchairIncluded: p.IsWheelchairIncluded,
        TotalBaggagePrice: p.TotalBaggagePrice,
        TotalMealPrice: p.TotalMealPrice,
        TotalSeatPrice: p.TotalSeatPrice,
        ExtraSeat: p.ExtraSeat || [],
        ExtraMeal: p.ExtraMeal || [],
        ExtraBaggages: p.ExtraBaggages || [],
      });
    });

    const filteredPassengers =
      _.cloneDeep(this.extraServices)
        .map((p: any) => {
          const original = originalMap.get(p.PassengerId);

          // Filter and clean open items
          p.ExtraSeat = p.ExtraSeat.filter((i: any) => i.IsOpen).map((i: any) => _.omit(i, 'IsOpen'));
          p.ExtraMeal = p.ExtraMeal.filter((i: any) => i.IsOpen).map((i: any) => _.omit(i, 'IsOpen'));
          p.ExtraBaggages = p.ExtraBaggages.filter((i: any) => i.IsOpen).map((i: any) => _.omit(i, 'IsOpen'));

          // Update included flags
          p.IsSeatIncluded = p.ExtraSeat.length > 0;
          p.IsMealIncluded = p.ExtraMeal.length > 0;
          p.IsBaggageIncluded = p.ExtraBaggages.length > 0;

          // Ensure original arrays are never null
          const originalSeat = original?.ExtraSeat || [];
          const originalMeal = original?.ExtraMeal || [];
          const originalBaggage = original?.ExtraBaggages || [];
          const originalIsWheelchairIncluded = original?.IsWheelchairIncluded || false;
          const originalIsBaggageIncluded = original?.IsBaggageIncluded || false;
          const originalIsMealIncluded = original?.IsMealIncluded || false;
          const originalIsSeatIncluded = original?.IsSeatIncluded || false;
          const originalTotalBaggagePrice = original?.TotalBaggagePrice || 0;
          const originalTotalMealPrice = original?.TotalMealPrice || 0;
          const originalTotalSeatPrice = original?.TotalSeatPrice || 0;

          const hasChanged =
            p.IsSeatIncluded !== originalIsSeatIncluded ||
            p.IsMealIncluded !== originalIsMealIncluded ||
            p.IsBaggageIncluded !== originalIsBaggageIncluded ||
            p.TotalBaggagePrice !== originalTotalBaggagePrice ||
            p.TotalMealPrice !== originalTotalMealPrice ||
            p.TotalSeatPrice !== originalTotalSeatPrice ||
            p.IsWheelchairIncluded !== originalIsWheelchairIncluded ||
            !_.isEqual(p.ExtraSeat, originalSeat) ||
            !_.isEqual(p.ExtraMeal, originalMeal) ||
            !_.isEqual(p.ExtraBaggages, originalBaggage);

          return {
            ...p,
            hasChanged,
            __wasIncluded: original?.IsSeatIncluded || original?.IsMealIncluded || original?.IsBaggageIncluded || original?.IsWheelchairIncluded,
          };
        })
        .filter((p: any) => p.hasChanged || (p.__wasIncluded && !p.IsSeatIncluded && !p.IsMealIncluded && !p.IsBaggageIncluded && !p.IsWheelchairIncluded))
        .map((i: any) => _.omit(i, ['__wasIncluded', 'hasChanged'])) || [];

    if (filteredPassengers.length > 0) {
      const requestModel = {
        EtpirAirTicketId: this.ticketData?.EtpirAirTicketId,
        PassengerExtraServices: filteredPassengers,
      };

      this.authService.addExtraServices(requestModel).subscribe({
        next: (data: any) => {
          if (data.Success) {
            this.showMessage('success', 'Extra Service Added', 'The extra service was added successfully.');
            this.fetchTicketData();
            this.showExtraServiceDialogue = false;
          } else {
            this.showMessage('error', 'Failed to Add Extra Service', 'An error occurred while adding the extra service.');
          }
        },
        error: (err: any) => {
          console.error('Error:', err);
          this.showMessage('error', 'Failed to Add Extra Service', 'An error occurred while adding the extra service.');
        },
      });
    } else {
      this.showMessage('info', 'No Selection Detected', 'No extra services were selected or changed.');
    }
  }

  showWheelchairColumn(): boolean {
    return this.ticketData?.Paxlist?.some((p: any) => p.IsWheelchairIncluded);
  }

  showBaggageColumn(): boolean {
    return this.ticketData?.Paxlist?.some((p: any) => p.IsBaggageIncluded);
  }

  showMealColumn(): boolean {
    return this.ticketData?.Paxlist?.some((p: any) => p.IsMealIncluded);
  }

  showSeatColumn(): boolean {
    return this.ticketData?.Paxlist?.some((p: any) => p.IsSeatIncluded);
  }

  changeExtraServiceBaggage(event: CheckboxChangeEvent, baggage: any, item: any) {
    if (!event.checked) {
      baggage.BaggageAllowance = '';
    }

    if (item?.ExtraBaggages?.every((b: any) => !b.IsOpen)) {
      item.TotalBaggagePrice = 0;
    }
  }

  changeExtraServiceMeal(event: CheckboxChangeEvent, meal: any, item: any) {
    if (!event.checked) {
      meal.MealType = '';
    }

    if (item?.ExtraMeal?.every((b: any) => !b.IsOpen)) {
      item.TotalMealPrice = 0;
    }
  }

  changeExtraServiceSeat(event: CheckboxChangeEvent, seat: any, item: any) {
    if (!event.checked) {
      seat.SeatNo = '';
    }

    if (item?.ExtraSeat?.every((b: any) => !b.IsOpen)) {
      item.TotalSeatPrice = 0;
    }
  }

  fetchTicketData() {
    const isReissueSearch = this.ticketType === 'Reissue';

    this.authService.getTicketAfterRetrieve(this.pnrNumber, isReissueSearch).subscribe({
      next: (data: any) => {
        if (data?.Success) {
          this.ticketData = data.Payload;
          this.ticketData.ActualFareBreakDown = this.ticketData?.FareBrakeDown;
          this.hadExtraService = this.ticketData?.ExtraServiceItems?.PassengerExtraServices?.length;
          this.prepareFareModel();
          this.getBaggageData();

          if (this.ticketData?.ChargeType) {
            this.fareType = this.ticketData?.ChargeType;
            this.isEditedFare = true;
          } else {
            this.isEditedFare = false;
          }

          this.ticketData.isDomestic = this.ticketData?.Routes?.every((route: any) => this.domesticPlaces.includes(route.Origin) && this.domesticPlaces.includes(route.Destination));
          this.childFares = this.ticketData?.FareBrakeDown?.PaxFareBreakdown?.filter((f: any) => f.PaxType === 'CHD' || f.PaxType === 'CNN').map((f: any, i: number) => ({ ...f, Fare: `Fare${i + 1}` })) || [];

          const mergedPaxList = this.ticketData?.Paxlist.map((pax: any) => {
            const extra = this.ticketData?.ExtraServiceItems?.PassengerExtraServices?.find((e: any) => e.PassengerId === pax.PassengerId);
            return {
              ...pax,
              IsWheelchairIncluded: extra?.IsWheelchairIncluded ?? false,
              IsBaggageIncluded: extra?.IsBaggageIncluded ?? false,
              IsSeatIncluded: extra?.IsSeatIncluded ?? false,
              IsMealIncluded: extra?.IsMealIncluded ?? false,
              ExtraBaggages: extra?.ExtraBaggages ?? [],
              ExtraSeat: extra?.ExtraSeat ?? [],
              ExtraMeal: extra?.ExtraMeal ?? [],
              IsSplitted: false,
              ChooseFare: 'Fare1',
            };
          });

          this.ticketData.Paxlist = mergedPaxList;
          this.ticketData.IsWheelchairIncluded = this.showWheelchairColumn();
          this.ticketData.IsBaggageIncluded = this.showBaggageColumn();
          this.ticketData.IsSeatIncluded = this.showSeatColumn();
          this.ticketData.IsMealIncluded = this.showMealColumn();

          this.ticketService.setTicketData(this.ticketData);
        } else {
          this.showMessage('error', 'Ticket Not Found', 'The requested ticket information could not be retrieved.');
          setTimeout(() => {
            this.router.navigate(['/tickets']);
          }, 300);
        }
      },
      error: () => {
        this.showMessage('error', 'Ticket Not Found', 'The requested ticket information could not be retrieved.');
        setTimeout(() => {
          this.router.navigate(['/tickets']);
        }, 300);
      },
    });
  }

  prepareSplitTicketData() {
    const selectedPassengers = JSON.parse(this.encrDecr.getString(environment.encryptionKey, this.encryptedPaxKey));

    const isReissueSearch = this.ticketType === 'Reissue';

    this.authService.getTicketAfterRetrieve(this.pnrNumber, isReissueSearch).subscribe({
      next: (data: any) => {
        if (data?.Success) {
          this.ticketData = data.Payload;

          this.getBaggageData();

          this.ticketData.isDomestic = this.ticketData?.Routes?.every((route: any) => this.domesticPlaces.includes(route.Origin) && this.domesticPlaces.includes(route.Destination));

          const paxList = this.ticketData?.Paxlist.filter((original: any) => selectedPassengers?.some((selected: any) => selected.TicketNo === original.TicketNo));
          const mergedPaxList = paxList.map((pax: any) => {
            const extra = this.ticketData?.ExtraServiceItems?.PassengerExtraServices?.find((e: any) => e.PassengerId === pax.PassengerId);

            return {
              ...pax,
              IsWheelchairIncluded: extra?.IsWheelchairIncluded ?? false,
              IsBaggageIncluded: extra?.IsBaggageIncluded ?? false,
              IsSeatIncluded: extra?.IsSeatIncluded ?? false,
              IsMealIncluded: extra?.IsMealIncluded ?? false,
              ExtraBaggages: extra?.ExtraBaggages ?? [],
              ExtraSeat: extra?.ExtraSeat ?? [],
              ExtraMeal: extra?.ExtraMeal ?? [],
              IsSplitted: false,
              ChooseFare: 'Fare1',
            };
          });
          this.ticketData.Paxlist = mergedPaxList;

          this.ticketData.IsWheelchairIncluded = this.showWheelchairColumn();
          this.ticketData.IsBaggageIncluded = this.showBaggageColumn();
          this.ticketData.IsSeatIncluded = this.showSeatColumn();
          this.ticketData.IsMealIncluded = this.showMealColumn();

          this.childFares =
            this.ticketData?.FareBrakeDown?.PaxFareBreakdown?.filter((f: any) => f.PaxType === 'CHD' || f.PaxType === 'CNN').map((f: any, index: number) => ({
              ...f,
              Fare: `Fare${index + 1}`,
            })) || [];

          const localFareBreakDown = [];

          const adultPassenger = selectedPassengers?.filter((p: any) => p.PaxType === 'ADT');
          const adultFareBreakDown = this.ticketData?.FareBrakeDown?.PaxFareBreakdown?.find((f: any) => f.PaxType === 'ADT');

          if (adultFareBreakDown && adultPassenger?.length) {
            adultFareBreakDown.NoOfPax = adultPassenger?.length;
            localFareBreakDown.push(adultFareBreakDown);
          }

          const childrenFare1Passenger = selectedPassengers?.filter((p: any) => (p.PaxType === 'CNN' || p.PaxType === 'CHD') && p?.ChooseFare === 'Fare1');
          const childrenFare1PassengerFareBreakDown = this.childFares?.find((f: any) => (f.PaxType === 'CNN' || f.PaxType === 'CHD') && f?.Fare === 'Fare1');

          if (childrenFare1Passenger?.length && childrenFare1PassengerFareBreakDown) {
            childrenFare1PassengerFareBreakDown.NoOfPax = childrenFare1Passenger?.length;
            localFareBreakDown.push(childrenFare1PassengerFareBreakDown);
          }

          const childrenFare2Passenger = selectedPassengers?.filter((p: any) => (p.PaxType === 'CNN' || p.PaxType === 'CHD') && p?.ChooseFare === 'Fare2');
          const childrenFare2PassengerFareBreakDown = this.childFares?.find((f: any) => (f.PaxType === 'CNN' || f.PaxType === 'CHD') && f?.Fare === 'Fare2');

          if (childrenFare2Passenger?.length && childrenFare2PassengerFareBreakDown) {
            childrenFare2PassengerFareBreakDown.NoOfPax = childrenFare2Passenger?.length;
            localFareBreakDown.push(childrenFare2PassengerFareBreakDown);
          }

          const infantPassenger = selectedPassengers?.filter((p: any) => p.PaxType === 'INF');
          const infantFareBreakDown = this.ticketData.FareBrakeDown?.PaxFareBreakdown?.find((f: any) => f.PaxType === 'INF');

          if (infantPassenger?.length && infantFareBreakDown) {
            infantFareBreakDown.NoOfPax = infantPassenger?.length;
            localFareBreakDown.push(infantFareBreakDown);
          }

          this.ticketData.FareBrakeDown.PaxFareBreakdown = [];
          this.ticketData.FareBrakeDown.PaxFareBreakdown = localFareBreakDown;

          this.ticketData.FareBrakeDown.AIT = 0;
          this.ticketData.FareBrakeDown.ExtraService = 0;
          this.ticketData.FareBrakeDown.BaseFare = 0;
          this.ticketData.FareBrakeDown.Tax = 0;
          this.ticketData.FareBrakeDown.Discount = 0;
          this.ticketData.FareBrakeDown.ServiceCharge = 0;

          for (const fare of localFareBreakDown) {
            const pax = fare.NoOfPax || 0;
            this.ticketData.FareBrakeDown.AIT += (fare.AIT || 0) * pax;
            this.ticketData.FareBrakeDown.BaseFare += (fare.BaseFare || 0) * pax;
            this.ticketData.FareBrakeDown.Tax += (fare.Tax || 0) * pax;
            this.ticketData.FareBrakeDown.Discount += (fare.Discount || 0) * pax;
            this.ticketData.FareBrakeDown.ServiceCharge += (fare.ServiceCharge || 0) * pax;
          }

          const extraServiceSumForFare = this.ticketData?.ExtraServiceItems?.PassengerExtraServices?.filter((s: any) => selectedPassengers.find((p: any) => p.PassengerId === s.PassengerId)).reduce((sum: number, s: any) => {
            return sum + (s.TotalBaggagePrice || 0) + (s.TotalSeatPrice || 0) + (s.TotalMealPrice || 0);
          }, 0);

          this.ticketData.FareBrakeDown.ExtraService = extraServiceSumForFare || 0;

          this.ticketService.setTicketData(this.ticketData);
        } else {
          this.showMessage('error', 'Ticket Not Found', 'The requested ticket information could not be retrieved.');
          setTimeout(() => {
            this.router.navigate(['/tickets']);
          }, 300);
        }
      },
      error: () => {
        this.showMessage('error', 'Ticket Not Found', 'The requested ticket information could not be retrieved.');
        setTimeout(() => {
          this.router.navigate(['/tickets']);
        }, 300);
      },
    });
  }

  ngOnInit(): void {
    this.airLogos = airlineLogos;
    if (localStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(localStorage.getItem('isSubUser'));
    } else if (sessionStorage.getItem('isSubUser')) {
      this.isSubUser = this.encrDecr.getObject(sessionStorage.getItem('isSubUser'));
    } else {
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 500);
    }

    this.route.queryParamMap.subscribe((params) => {
      this.pnrNumber = params.get('pnr');
      this.template = params.get('template');
      this.viewMode = params.get('mode');
      this.encryptedPaxKey = params.get('pax');
      this.ticketType = params.get('ticketType');
      console.log(this.ticketType);
    });

    if (this.viewMode === 'selected') {
      this.prepareSplitTicketData();
    }

    if (this.viewMode === 'live') {
      this.fetchTicketData();
    }

    if (this.viewMode === 'preview') {
      this.ticketData = previewTicketData;
      this.getBaggageData();
      this.ticketService.setTicketData(this.ticketData);
    }

    this.airportListSubject.pipe(debounceTime(1000)).subscribe((event) => {
      this.getCityList(event);
    });

    this.airlineListSubject.pipe(debounceTime(1000)).subscribe((event) => {
      this.getAirlinesName(event);
    });

    if (!this.isSubUser) {
      this.isShowTab = true;
    } else {
      this.authService.getPermission().subscribe((res: any) => {
        if (res.Success) {
          this.permissions = res.Payload;
          if (this.permissions?.length) {
            if (this.permissions[1]?.HasPermission) {
              this.isShowTab = true;
            }
          }
        }
      });
    }
  }

  permissions;
  isShowTab = false;
  isSubUser = false;

  downloadAsPdf() {
    const style =
      ' <style> *{font-family: Arial, Helvetica, sans-serif;} p{color:#5B5B5B;} .bbt {border-bottom:2px solid #ddd;} .fwb{font-weight: bold;} .pad0{padding:0px;} .pad10{padding:10px;} .fs12{font-size: 12px;}  .header_div h5 {overflow:hidden; margin:10px !important; background: #c9cecf; color: #696363 !important; display:block;} .doNotPrint{display:none;} .mleft10p{display: block;  padding: 5px !important; line-height: 15px;  margin: 0px !important;} .table {color: #696363 !important;background-color: white;width: 100%;margin-bottom: 0px;max-width:100%;text-align: center !important; vertical-align: top !important; } .table > thead:first-child > tr:first-child > th {border-top: 0; font-weight: bold; color:#000;} .table-bordered, .table-bordered > tbody > tr > td, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > td, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td,  .table-bordered > thead > tr > th {vertical-align:middle; border: 1px solid #ddd !importnat;  padding: 0px; line-height: 1.428571429; font-size: 12px; } .table-bordered tr th{vertical-align: top !importnat;} .table-bordered td, .table-bordered th {border: 1px solid #dee2e6 !important;} .container.main .row{border:1px solid #dedede !important; padding:5px !important;}</style> <meta charset="utf-8"> ';
    const ticket = document.getElementById('ticket-content')?.innerHTML;

    const html = style + '' + '' + ticket;

    const title = `TICKET-${uuidv4()}`;
    const model = {
      html: html,
      Title: title,
    };

    this.authService.getPDFFromHTML(model).subscribe(
      (data: any) => {
        console.log(data);
        if (data.Success) {
          if (data.Payload) {
            var url = data.Payload;
            window.open(url, '_blank');
          }
        } else {
          this.showMessage('warn', 'File Not Downloaded', 'Could Not Download The File Now. Try Again Later.');
        }
      },
      (error) => {
        this.showMessage('warn', 'File Not Downloaded', 'Could Not Download The File Now. Try Again Later.');
      },
    );
  }

  downloadAsDoc() {
    const style =
      ' <style> *{font-family: Arial, Helvetica, sans-serif;} p{color:#5B5B5B;} .bbt {border-bottom:2px solid #ddd;} .fwb{font-weight: bold;} .pad0{padding:0px;} .pad10{padding:10px;} .fs12{font-size: 12px;}  .header_div h5 {overflow:hidden; margin:10px !important; background: #c9cecf; color: #696363 !important; display:block;} .doNotPrint{display:none;} .mleft10p{display: block;  padding: 5px !important; line-height: 15px;  margin: 0px !important;} .table {color: #696363 !important;background-color: white;width: 100%;margin-bottom: 0px;max-width:100%;text-align: center !important; vertical-align: top !important; } .table > thead:first-child > tr:first-child > th {border-top: 0; font-weight: bold; color:#000;} .table-bordered, .table-bordered > tbody > tr > td, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > td, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td,  .table-bordered > thead > tr > th {vertical-align:middle; border: 1px solid #ddd !importnat;  padding: 0px; line-height: 1.428571429; font-size: 12px; } .table-bordered tr th{vertical-align: top !importnat;} .table-bordered td, .table-bordered th {border: 1px solid #dee2e6 !important;} .container.main .row{border:1px solid #dedede !important; padding:5px !important;}</style> <meta charset="utf-8"> ';
    const ticket = document.getElementById('ticket-content')?.innerHTML;

    const html = style + '' + '' + ticket;

    const title = `TICKET-${uuidv4()}`;
    const model = {
      html: html,
      Title: title,
    };
    // var newWindow = window.open();
    this.authService.getDocFromHTML(model).subscribe(
      (data: any) => {
        console.log(data);
        if (data.Success) {
          if (data.Payload) {
            var url = data.Payload;
            window.open(url, '_blank');
          }
        } else {
          this.showMessage('warn', 'File Not Downloaded', 'Could Not Download The File Now. Try Again Later.');
        }
      },
      (error) => {
        this.showMessage('warn', 'File Not Downloaded', 'Could Not Download The File Now. Try Again Later.');
      },
    );
  }

  prepareFareModel() {
    this.editPriceModel = [];
    this.editPriceModel.push(..._.cloneDeep(this.ticketData.FareBrakeDown?.PaxFareBreakdown));
    this.editPriceModel = this.editPriceModel.map((p: any) => ({ ...p, editedBase: p.BaseFare - p.Discount }));
    this.grandTotalAfterEdit = this.editPriceModel.reduce((a: any, c: any) => a + (c.BaseFare + c.Tax + c.ServiceCharge - c.Discount) * c.NoOfPax, 0);
  }

  calculatePrices(passenger: any) {
    let discountedBase = 0;
    let discountAmount;
    if (this.fareType == 'Flat') {
      const maxValue = passenger.BaseFare + passenger.Tax;
      if (passenger.Discount > maxValue) {
        passenger.Discount = maxValue;
      }

      const baseFare = passenger.BaseFare;
      discountedBase = baseFare - passenger.Discount;
      passenger.editedBase = discountedBase;
      discountAmount = passenger.Discount;
    } else if (this.fareType == 'Percent') {
      const maxValue = 100;
      if (passenger.Discount > maxValue) {
        passenger.Discount = maxValue;
      }

      const baseFare = passenger.BaseFare;
      const discountPercent = passenger.Discount || 0;
      discountAmount = (baseFare * discountPercent) / 100;
      discountedBase = baseFare - discountAmount;
      passenger.editedBase = discountedBase;
    }

    passenger.TotalFare = discountedBase + passenger.Tax + passenger.ServiceCharge;
    this.grandTotalAfterEdit = this.editPriceModel.reduce((a: any, c: any) => a + (c.editedBase + c.Tax + c.ServiceCharge) * c.NoOfPax, 0);
  }

  submitEditPrice() {
    const paxModel = this.editPriceModel.map((pax: any) => {
      return {
        ServiceCharge: pax.ServiceCharge || 0,
        Discount: pax.Discount || 0,
        PaxType: pax.PaxType,
        BaseFare: pax.BaseFare,
        TaxFare: pax.Tax,
        ChargeType: this.fareType,
      };
    });

    const requestModel = {
      EtpirAirTicketId: this.ticketData?.EtpirAirTicketId,
      RefNo: this.ticketData.TicketingDetails?.RefNo,
      EtpirAirTicketCustomPaxFare: paxModel,
    };

    this.authService.editTicketPrice(requestModel).subscribe({
      next: (data: any) => {
        if (data.Success) {
          this.showMessage('success', 'Success', 'Fare updated successfully.');
          this.showEditFareDialogue = false;
          this.fetchTicketData();
        } else {
          this.showMessage('error', 'Error', 'Fare update failed.');
        }
      },
      error: (error) => {
        console.error('API error:', error);
      },
    });
  }

  hideDialog() {
    this.showEditFareDialogue = false;
  }

  openEditModal() {
    this.prepareFareModel();
    this.showEditFareDialogue = true;
  }

  showSegmentModal = false;
  segmentList: any = [];
  singleSegment: any = {};
  minDeparture;
  openSegmentModal() {
    this.segmentList = [...(this.ticketData?.TravelDetials?.OnwardSegmentList ?? []), ...(this.ticketData?.TravelDetials?.ReturnSegmentList ?? [])];
    this.minDeparture = this.segmentList[this.segmentList.length - 1]?.ArrivalDate ?? new Date();

    this.segmentMode = 'list';
    this.isEditMode = false;
    this.hasError = false;

    this.showSegmentModal = true;
  }

  showMessage(severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary', summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  hideEmailDialog() {
    this.emailDialog = false;
    this.emailSubject = '';
    this.emailAddress = '';
  }

  openEmailDialogue() {
    this.emailDialog = true;
  }

  sendEmail() {
    if (this.emailSubject.trim() === '' || this.emailAddress.trim() === '') {
      this.showMessage('warn', 'Warning', 'Please Type Email Address / Email Subject');
      return;
    }
    const value = this.validateEmail(this.emailAddress);

    if (!value) {
      this.showMessage('warn', 'Warning', 'Invalid Email');
      return;
    } else {
      const style = ' <style> *{font-family: Poppins, sans-serif} p{color:#5B5B5B;} .doNotPrint{display:none;} .table-bordered td, .table-bordered th {border: 1px solid #dee2e6 !important;} table tr th, table tr td{padding-top: 5px !important;padding-bottom: 5px !important;} .important__info ul{padding-left: 0} </style> <meta charset="utf-8"> ';
      const ticket = document.getElementById('ticket-content')?.innerHTML;
      const html = style + '' + '' + ticket;

      const model = {
        EmailRecevers: this.emailAddress,
        EmailSubject: this.emailSubject,
        EmailBody: html,
      };

      this.authService.sendBookingConfirmPageEmail(model).subscribe(
        (data: any) => {
          if (data.Success) {
            this.showMessage('success', 'Email Sent', 'The email was sent successfully.');
            this.emailDialog = false;
            this.emailAddress = '';
            this.emailSubject = '';
          } else {
            this.showMessage('error', 'Email Failed', 'The email could not be sent. Please try again later.');
          }
        },
        (error: any) => {
          console.log(error);
          this.showMessage('error', 'Server Error', 'There was a problem with the server. Please try again later.');
        },
      );
    }
  }

  setFareType(edited: boolean) {
    this.preloaderService.showSpinner();
    this.isEditedFare = edited;
    if (!this.isEditedFare) {
      this.ticketData.FareBrakeDown = this.ticketData?.OriginalFareBrakeDown;
      this.ticketService.setTicketData(this.ticketData);
    } else {
      this.ticketData.FareBrakeDown = this.ticketData?.ActualFareBreakDown;
      this.ticketService.setTicketData(this.ticketData);
    }
  }

  toggleFareInfo() {
    this.isShowFare = !this.isShowFare;
  }

  apiDateToString(apiDate: string | Date | null) {
    if (apiDate) {
      const date = new Date(apiDate);
      const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      return dateString;
    }
    return null;
  }

  apiDateTimeToString(apiDate: string | Date | null): string | null {
    if (apiDate) {
      const date = new Date(apiDate);
      // Adjust for timezone offset
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const dateString = localDate.toISOString().replace('T', ' ').split('.')[0]; // "YYYY-MM-DD HH:mm:ss"
      return dateString;
    }
    return null;
  }

  applyTheme(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },

      accept: () => this.onThemeSubmit(this.template),
    });
  }

  onThemeSubmit(id: any) {
    const formData = new FormData();

    // Append simple fields
    formData.append('TemplateId', id);

    this.authService.editProfile(formData).subscribe({
      next: (response: any) => {
        if (response.Success) {
          this.authService.loadUserFromServer();
          this.authService.loadUserPermissions();
          this.showMessage('info', 'Success', 'The ticket theme has been applied successfully.');
          this.router.navigate(['/settings/choose-templates']);
        } else {
          this.showMessage('error', 'Theme Application Failed', response.Message || 'The theme could not be applied. Please try again.');
        }
      },
      error: (err) => {
        console.error('HTTP Error:', err);
      },
    });
  }

  openSplitTicketModal() {
    this.ticketData.Paxlist = this.ticketData.Paxlist?.map((p: any) => ({ ...p, IsSplitted: false }));
    this.showSplitTicketModal = true;
  }

  splitSelectedPassengers() {
    if (this.ticketData?.Paxlist?.every((p: any) => !p.IsSplitted)) {
      return this.showMessage('info', 'Passenger Required', 'Please select a passenger to view their individual tickets.');
    }

    const selectedPassengers = this.ticketData?.Paxlist?.filter((p: any) => p.IsSplitted);
    const encryptedPassenger = this.encrDecr.setString(
      environment.encryptionKey,
      JSON.stringify(
        selectedPassengers.map((x: any) => ({
          PassengerName: x.PassengerName,
          TicketNo: x.TicketNo,
          ChooseFare: x.ChooseFare,
          PaxType: x.PaxType,
          PassengerId: x.PassengerId,
        })),
      ),
    );

    this.showSplitTicketModal = false;

    const pnr = this.pnrNumber ?? '';
    const template = this.authService.user()?.TemplateId ?? 1;

    const queryParams = new URLSearchParams({
      pnr,
      template: template.toString(),
      mode: 'selected',
      ticketType: this.ticketType ? String(this.ticketType) : '',
      pax: encryptedPassenger,
    });

    const url = `${environment.apiPrefix}/settings/ticket?${queryParams.toString()}`;
    console.log(url);
    window.open(url, '_blank');
  }

  isChildOrInfant(passenger: any): boolean {
    return passenger.PaxType === 'CNN' || passenger.PaxType === 'CHD' || passenger.PaxType === 'INF';
  }

  isAdultSelected(): boolean {
    return this.ticketData?.Paxlist?.some((p: any) => p.IsSplitted && p.PaxType === 'ADT');
  }

  onSelectionChange() {
    const hasAdult = this.isAdultSelected();
    if (!hasAdult) {
      this.ticketData?.Paxlist?.forEach((p: any) => {
        if (this.isChildOrInfant(p)) {
          p.IsSplitted = false;
        }
      });
    }
  }

  toggleSplit(passenger: any) {
    if (this.isChildOrInfant(passenger) && !this.isAdultSelected()) return;
    passenger.IsSplitted = !passenger.IsSplitted;
    this.onSelectionChange();
  }

  private airportListSubject: Subject<string> = new Subject();
  private airlineListSubject: Subject<string> = new Subject();
  airportList: any = [];

  searchCity(event: string) {
    this.airportListSubject.next(event);
  }

  searchAirline(event: string) {
    this.airlineListSubject.next(event);
  }

  @ViewChild('originSelect') originSelect!: any;

  getCityList(searchString: string) {
    this.authService.getAirports(searchString).subscribe((data: any) => {
      this.airportList = data.map((item: any) => {
        const [airportName, city, country] = item.SearchString.split(',');
        return {
          name: `${item.AirportCode} - ${airportName} (${city}, ${country})`,
          code: item.AirportCode,
        };
      });
    });
  }

  toAirSegmentRequest(raw: any): AirSegmentRequest {
    return {
      Id: raw.Id,
      CarrierCode: raw.CarrierCode.code.trim(),
      FlightNumber: raw.FlightNumber.trim(),
      Origin: raw.OriginAirPortName?.code.trim() ?? '',
      Destination: raw.ArrivalAirPortName?.code.trim() ?? '',
      DepartureDate: this.apiDateTimeToString(raw.DepartureDate),
      ArrivalDate: this.apiDateTimeToString(raw.ArrivalDate),
      ConfirmationNo: raw.ConfirmationNo,
      DepartureTerminal: raw.OriginTerminal.trim(),
      ArrivalTerminal: raw.ArrivalTerminal.trim(),
      CabinClass: raw.CabinClass.trim(),
      AirCraft: raw.AirCraft.trim(),
      BookingClass: raw.BookingClass.trim(),
      AirBaggageAllowance: raw.AirBaggageAllowance ? raw.AirBaggageAllowance + raw.AirBaggageUnit : null,
      CabinBaggageAllowance: raw.CabinBaggageAllowance,
      CabinTypeName: raw.CabinTypeName?.name ?? '',
      SegmentType: raw.SegmentType,
    };
  }

  hasError = false;
  addSegment(): any {
    if (!this.singleSegment.CarrierCode || !this.singleSegment.FlightNumber || !this.singleSegment.OriginAirPortName || !this.singleSegment.ArrivalAirPortName || !this.singleSegment.DepartureDate || !this.singleSegment.ArrivalDate || !this.singleSegment.ConfirmationNo || !this.singleSegment.CabinTypeName) {
      this.hasError = true;
      return false;
    }

    this.hasError = false;

    const requestModel = {
      EtpirAirTicketId: this.ticketData?.EtpirAirTicketId,
      EtpirAirSegments: this.toAirSegmentRequest(this.singleSegment),
      IsForUpdate: this.segmentMode === 'edit',
    };

    this.authService.addAirSegment(requestModel).subscribe({
      next: (res) => {
        if (res.Success) {
          this.isEditMode = false;
          this.segmentMode = 'list';
          this.showMessage('success', 'Segment Successfully Saved', res?.Message);

          this.fetchTicketData();
        } else {
          this.showMessage('error', 'Failed to Add Segment', 'Something went wrong while adding the segment. Please try again.');
        }
      },
      error: (err) => {
        this.showMessage('error', 'Failed to Add Segment', 'Something went wrong while adding the segment. Please try again.');
      },
    });
  }

  baggageUnits = [
    { label: 'KG', value: 'KG' },
    { label: 'Piece', value: 'Piece' },
  ];

  isEditMode = false;

  parseAirportInfo = (fullName: string, code: string) => {
    const [airportName, city, country] = fullName?.split(',') || ['', '', ''];
    return {
      name: `${code} - ${airportName?.trim()} (${city?.trim()}, ${country?.trim()})`,
      code,
    };
  };

  openEditItinerary(segment: any): void {
    const { FlightNumber, CarrierCode, OriginTerminal, ArrivalTerminal, CabinBaggage, AirBaggageAllowance, CabinClass, BookingCode, AirCraft, DepartureDate, ArrivalDate, OriginAirPortName, ArrivalAirPortName, CabinClassType, OriginName, DestinationName, SegmentType, AirSegmentId, CarrierName } = segment;

    const parseBaggageValue = (value: string): number => +value?.replace(/\D/g, '') || 0;

    this.singleSegment = {
      Id: AirSegmentId,
      FlightNumber,
      CarrierCode: { name: CarrierName, code: CarrierCode },
      OriginTerminal,
      ArrivalTerminal,
      CabinBaggageAllowance: parseBaggageValue(CabinBaggage),
      AirBaggageAllowance: parseBaggageValue(AirBaggageAllowance),
      CabinClass,
      BookingClass: BookingCode,
      AirCraft,
      DepartureDate: new Date(DepartureDate),
      ArrivalDate: new Date(ArrivalDate),
      CarrierName: CarrierName,
      OriginAirPortName: this.parseAirportInfo(OriginAirPortName, OriginName),
      ArrivalAirPortName: this.parseAirportInfo(ArrivalAirPortName, DestinationName),
      SegmentType,
      CabinTypeName: this.classTypes?.find((type) => type.name === CabinClassType),
      AirBaggageUnit: 'KG',
      ConfirmationNo: this.ticketData?.TicketingDetails?.ConfirmationNo,
    };

    this.isEditMode = true;
    this.segmentMode = 'edit';
  }

  segmentMode = '';

  openAddItinerary() {
    let lastArrivalCode = '';
    let lastArrivalName = '';
    let lastCarrierName = '';
    let lastCarrierCode = '';

    const segments = this.ticketData?.TravelDetials?.ReturnSegmentList?.length ? this.ticketData.TravelDetials.ReturnSegmentList : this.ticketData?.TravelDetials?.OnwardSegmentList;

    if (segments?.length) {
      const last = segments[segments.length - 1];
      lastArrivalCode = last.DestinationName;
      lastArrivalName = last.ArrivalAirPortName;
      lastCarrierName = last.CarrierName;
      lastCarrierCode = last.CarrierCode;
    }

    this.singleSegment = {
      Id: 0,
      FlightNumber: '',
      CarrierCode: { name: lastCarrierName, code: lastCarrierCode },
      OriginTerminal: '',
      ArrivalTerminal: '',
      CabinBaggageAllowance: '',
      AirBaggageAllowance: '',
      CabinClass: '',
      BookingClass: '',
      AirCraft: '',
      DepartureDate: new Date(this.minDeparture),
      ArrivalDate: '',
      CarrierName: '',
      OriginAirPortName: this.parseAirportInfo(lastArrivalName, lastArrivalCode),
      ArrivalAirPortName: '',
      SegmentType: '2',
      CabinTypeName: '',
      AirBaggageUnit: 'KG',
      ConfirmationNo: this.ticketData?.TicketingDetails?.ConfirmationNo,
    };

    this.isEditMode = true;
    this.segmentMode = 'create';
  }

  airlines: any = [];
  getAirlinesName(event: any) {
    this.authService.getAirlineList(event).subscribe((data: any) => {
      if (data.Success) {
        this.airlines = data.Payload.map((item: any) => {
          return {
            name: item?.AriLineName,
            code: item?.Code,
          };
        });
      }
      console.log(this.airlines);
    });
  }

  handleDeleteSegment(event: Event, segment: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to delete this segment?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
      },

      accept: () => this.deleteSegment(segment),
    });
  }

  deleteSegment({ AirSegmentId }: any) {
    const requestModel = {
      EtpirAirTicketId: this.ticketData?.EtpirAirTicketId,
      AirSegmentId,
    };
    this.authService.deleteSegmentInfo(requestModel).subscribe({
      next: (res: any) => {
        if (res.Success) {
          this.showMessage('success', 'Deleted', 'Segment deleted successfully');
          this.fetchTicketData();
        }
        console.log('Segment deleted successfully', res);
      },
      error: (err) => {
        console.error('Error deleting segment', err);
        this.showMessage('error', 'Error', 'Failed to delete segment');
      },
    });
  }

  get onwardRoute(): string {
    const onwardSegments = this.ticketData?.TravelDetials?.OnwardSegmentList;
    if (!onwardSegments || onwardSegments.length === 0) return '';
    const from = onwardSegments[0]?.OriginName;
    const to = onwardSegments[onwardSegments.length - 1]?.DestinationName;
    return from && to ? `(${from} - ${to})` : '';
  }

  get returnRoute(): string {
    const onwardSegments = this.ticketData?.TravelDetials?.ReturnSegmentList;
    if (!onwardSegments || onwardSegments.length === 0) return '';
    const from = onwardSegments[0]?.OriginName;
    const to = onwardSegments[onwardSegments.length - 1]?.DestinationName;
    return from && to ? `(${from} - ${to})` : '';
  }

  minSelectableDate: Date = new Date();

  ngDoCheck() {
    const current = this.singleSegment?.DepartureDate;

    if (current) {
      const newMinDate = new Date(current);
      newMinDate.setMinutes(newMinDate.getMinutes() + 30);

      if (this.minSelectableDate.getTime() !== newMinDate.getTime()) {
        this.minSelectableDate = newMinDate;
      }
    }
  }

  getSafeUrl(base64: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }
}
