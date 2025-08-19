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
import { ActivatedRoute, Router } from '@angular/router';
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
import { AuthService } from '../../common-module/services/auth.service';

@Component({
  providers: [MessageService],
  imports: [CommonModule, AccordionModule, AvatarModule, BadgeModule, DrawerModule, Checkbox, ButtonModule, RadioButtonModule, FormsModule, ReactiveFormsModule, SelectModule, ToastModule, AutoCompleteModule, DatePickerModule, NgClickOutsideDirective, TabsModule, TooltipModule, DialogModule, NgxPrintModule, TabsModule, InputNumberModule],
  animations: [trigger('dropdownAnimation', [transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]), transition(':leave', [animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))])])],
  selector: 'app-dashboard',
  styleUrl: './flight-list.component.scss',
  template: `
    <div class="w-full main-container">
      <p-toast />

      <div class="m-auto">
        <form (ngSubmit)="searchFlight()" [formGroup]="searchForm" class="bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                *ngFor="let type of journeyTypes"
                (click)="onJourneyTypeChange(type.value)"
                [ngClass]="searchForm.get('journeyType')?.value === type.value ? 'text-white shadow' : 'text-gray-500 border border-gray-200 hover:text-[#E50000] hover:border-[#E50000]'"
                [ngStyle]="searchForm.get('journeyType')?.value === type.value ? { 'background-color': '#E50000', 'border-color': '#E50000' } : {}"
                class="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition"
              >
                <span [ngClass]="searchForm.get('journeyType')?.value === type.value ? 'border-2 border-white' : 'border border-gray-400'" [ngStyle]="searchForm.get('journeyType')?.value === type.value ? { 'background-color': '#E50000' } : {}" class="h-4 w-4 rounded-full"></span>

                {{ type.label }}
              </button>
            </div>

            <div class="flex gap-3">
              <div class="relative inline-block text-left" (clickOutside)="showPaxDropdown = false">
                <!-- Traveller Button -->
                <button type="button" (click)="toggleShowPaxDropdown()" class="flex w-[150px] gap-0 items-center justify-between rounded-lg bg-red-50 px-5 py-3 text-sm font-semibold text-[#E50000] shadow-sm">
                  <div class="flex gap-2">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" class="text-lg max-sm:hidden" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M858.5 763.6a374 374 0 0 0-80.6-119.5 375.63 375.63 0 0 0-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 0 0-80.6 119.5A371.7 371.7 0 0 0 136 901.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 0 0 8-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"
                      ></path>
                    </svg>
                    {{ totalTravelars }} Travelers
                  </div>
                  <i class="pi pi-chevron-down"></i>
                </button>

                <div *ngIf="showPaxDropdown" @dropdownAnimation class="absolute z-10 mt-2 w-72 rounded-xl bg-white p-4 shadow-xl ring-1 ring-red-100">
                  <!-- Adults -->
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold m-0 text-gray-800">Adults</p>
                      <p class="text-xs text-gray-500">12 years & above</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" (click)="adultMinus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">-</button>
                      <span class="w-4 text-center text-sm font-medium text-gray-800">{{ adults }}</span>
                      <button type="button" (click)="adultPlus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">+</button>
                    </div>
                  </div>

                  <!-- Children -->
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold m-0 text-gray-800">Children</p>
                      <p class="text-xs text-gray-500">From 5 to under 12</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" (click)="childrenMinus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">-</button>
                      <span class="w-4 text-center text-sm font-medium text-gray-800">{{ children }}</span>
                      <button type="button" (click)="childrenPlus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">+</button>
                    </div>
                  </div>

                  <!-- Kids -->
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold m-0 text-gray-800">Kids</p>
                      <p class="text-xs text-gray-500">From 2 to under 5</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" (click)="kidsMinus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">-</button>
                      <span class="w-4 text-center text-sm font-medium text-gray-800">{{ kids }}</span>
                      <button type="button" (click)="kidsPlus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">+</button>
                    </div>
                  </div>

                  <!-- Infants -->
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold m-0 text-gray-800">Infants</p>
                      <p class="text-xs text-gray-500">Under 2 years</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" (click)="infantsMinus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">-</button>
                      <span class="w-4 text-center text-sm font-medium text-gray-800">{{ infants }}</span>
                      <button type="button" (click)="infantsPlus()" class="w-8 h-8 rounded-full border font-bold text-xl border-gray-300 text-gray-700 hover:border-[#E50000] hover:text-[#E50000] hover:bg-red-50 transition">+</button>
                    </div>
                  </div>

                  <!-- Done Button -->
                  <div class="mt-2">
                    <button type="button" (click)="toggleShowPaxDropdown()" class="w-full rounded-md border border-[#E50000] bg-white px-4 py-2 text-sm font-semibold text-[#E50000] hover:bg-red-50 transition">Done</button>
                  </div>
                </div>
              </div>

              <div class="relative w-[200px]" (clickOutside)="dropdownOpen = false">
                <button type="button" (click)="toggleClassDropdown()" class="flex w-full items-center justify-between rounded-lg gap-0 bg-red-50 px-5 py-3 text-sm font-semibold text-[#E50000]">
                  <div class="flex gap-2">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="text-lg max-sm:hidden" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path fill="none" d="M0 0h24v24H0V0z"></path>
                      <path
                        d="M7.59 5.41c-.78-.78-.78-2.05 0-2.83s2.05-.78 2.83 0 .78 2.05 0 2.83c-.79.79-2.05.79-2.83 0zM6 16V7H4v9c0 2.76 2.24 5 5 5h6v-2H9c-1.66 0-3-1.34-3-3zm14 4.07L14.93 15H11.5v-3.68c1.4 1.15 3.6 2.16 5.5 2.16v-2.16c-1.66.02-3.61-.87-4.67-2.04l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C8.01 7 7 8.01 7 9.25V15c0 1.66 1.34 3 3 3h5.07l3.5 3.5L20 20.07z"
                      ></path>
                    </svg>
                    {{ searchForm.get('classType')?.value?.name || 'Select Class Type' }}
                  </div>
                  <i class="pi pi-chevron-down"></i>
                </button>
                <div *ngIf="dropdownOpen" @dropdownAnimation class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md">
                  <div *ngFor="let type of classTypes" (click)="selectClassType(type)" class="cursor-pointer px-5 py-3 text-sm text-gray-700 hover:bg-sky-100 hover:text-[#E50000]">
                    {{ type.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div formArrayName="segments">
            <div *ngFor="let segment of segments.controls; let i = index" [formGroupName]="i" class="mt-5 grid gap-4" [ngClass]="searchForm.get('journeyType')?.value !== 2 ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'">
              <!-- Origin Input -->

              <div class="w-full" (clickOutside)="onClickedOutside(segment, 'showOrigin')">
                <div *ngIf="!segment.get('uiState.showOrigin')?.value" (click)="onTriggerClick($event, i, 'showOrigin')" class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 cursor-pointer w-full">
                  <div class="text-xl font-semibold text-gray-800">{{ segment.get('origin')?.value?.code }}</div>
                  <div class="h-8 w-px bg-gray-300"></div>
                  <div class="min-w-0 leading-tight">
                    <p class="text-sm font-semibold text-gray-800 mb-0">{{ segment.get('origin')?.value?.city || '' }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ segment.get('origin')?.value?.name || '' }}</p>
                  </div>
                </div>

                <div *ngIf="segment.get('uiState.showOrigin')?.value" class="rounded-lg border border-gray-300 px-4 py-3 w-full flex items-center gap-3">
                  <p-autocomplete
                    (click)="stopEventPropagation($event)"
                    #originAuto
                    appendTo="body"
                    formControlName="origin"
                    [suggestions]="airportList"
                    (completeMethod)="searchCity($event.query)"
                    optionLabel="name"
                    [field]="'city'"
                    showClear="true"
                    (onSelect)="toggleDropdown(i, 'showOrigin')"
                    [styleClass]="'w-full'"
                    class="custom-auto-complete border-none outline-none w-full text-sm text-gray-800"
                    [panelStyleClass]="'z-50'"
                    placeholder="Flying from Airport/City"
                  >
                    <ng-template let-country #item>
                      <div class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 w-full">
                        <div class="text-xl font-semibold text-gray-800">{{ country.code }}</div>
                        <div class="h-8 w-px bg-gray-300"></div>
                        <div class="min-w-0 leading-tight">
                          <p class="text-sm font-semibold text-gray-800 mb-0">{{ country.city }}</p>
                          <p class="text-xs text-gray-500 truncate">{{ country.name }}</p>
                        </div>
                      </div>
                    </ng-template>
                  </p-autocomplete>
                </div>
              </div>

              <!-- Destination Input -->
              <div class="w-full" (clickOutside)="onClickedOutside(segment, 'showDestination')">
                <div *ngIf="!segment.get('uiState.showDestination')?.value" (click)="onTriggerClick($event, i, 'showDestination')" class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 cursor-pointer w-full">
                  <div class="text-xl font-semibold text-gray-800">{{ segment.get('destination')?.value?.code }}</div>
                  <div class="h-8 w-px bg-gray-300"></div>
                  <div class="min-w-0 leading-tight">
                    <p class="text-sm font-semibold text-gray-800 mb-0">{{ segment.get('destination')?.value?.city }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ segment.get('destination')?.value?.name }}</p>
                  </div>
                </div>

                <div *ngIf="segment.get('uiState.showDestination')?.value" class="rounded-lg border border-gray-300 px-4 py-3 w-full flex items-center gap-3">
                  <p-autocomplete
                    (click)="stopEventPropagation($event)"
                    #returnAuto
                    formControlName="destination"
                    [suggestions]="airportList"
                    (completeMethod)="searchCity($event.query)"
                    optionLabel="name"
                    [field]="'city'"
                    showClear="true"
                    (onSelect)="toggleDropdown(i, 'showDestination')"
                    [styleClass]="'w-full'"
                    class="p-autocomplete-panel custom-auto-complete border-none outline-none w-full text-sm text-gray-800"
                    [panelStyleClass]="'z-50'"
                    placeholder="Flying from Airport/City"
                  >
                    <ng-template let-country #item>
                      <div class="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-3 w-full">
                        <div class="text-xl font-semibold text-gray-800">{{ country.code }}</div>
                        <div class="h-8 w-px bg-gray-300"></div>
                        <div class="min-w-0 leading-tight">
                          <p class="text-sm font-semibold text-gray-800 mb-0">{{ country.city }}</p>
                          <p class="text-xs text-gray-500 truncate">{{ country.name }}</p>
                        </div>
                      </div>
                    </ng-template>
                  </p-autocomplete>
                </div>
              </div>

              <!-- Departure Date -->
              <div class="w-full">
                <div class="grid grid-cols-6 gap-2 items-center">
                  <div [ngClass]="searchForm.get('journeyType')?.value !== 2 ? 'col-span-5' : 'col-span-6'">
                    <div *ngIf="segment.get('uiState.showDeparture')?.value" class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 w-full">
                      <p-datepicker [attr.data-index]="i" formControlName="departureDate" (onClickOutside)="toggleDropdown(i, 'showDeparture')" class="custom-datepicker" appendTo="body" #originDatepicker (onSelect)="toggleDropdown(i, 'showDeparture')" />
                    </div>

                    <div (click)="toggleDropdown(i, 'showDeparture')" *ngIf="!segment.get('uiState.showDeparture')?.value" class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 w-full cursor-pointer">
                      <div class="text-xl font-semibold text-gray-800">{{ segment.get('departureDate')?.value | date: 'dd' }}</div>
                      <div class="h-8 w-px bg-gray-300"></div>
                      <div class="min-w-0 leading-tight">
                        <p class="text-sm font-semibold text-gray-800 mb-0">{{ segment.get('departureDate')?.value | date: 'MMMM' }}</p>
                        <p class="text-xs text-gray-500">{{ segment.get('departureDate')?.value | date: 'EEEE, y' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Close Button (1 part) -->
                  <div class="flex justify-center items-center" *ngIf="segmentsLength > 1">
                    <button type="button" (click)="removeSegment(i)" class="h-8 w-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center">
                      <i class="pi pi-times text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Return Date -->
              <div class="w-full" *ngIf="searchForm.get('journeyType')?.value === 2">
                <div *ngIf="segment.get('uiState.showReturn')?.value" class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3">
                  <p-datepicker [attr.data-index]="i" formControlName="returnDate" (onClickOutside)="toggleDropdown(i, 'showReturn')" class="custom-datepicker" appendTo="body" #returnDatepicker (onSelect)="toggleDropdown(i, 'showReturn')" />
                </div>

                <div
                  [ngClass]="{
                    'opacity-50 pointer-events-none cursor-not-allowed': searchForm.get('journeyType')?.value === 1,
                    'opacity-100': searchForm.get('journeyType')?.value !== 1,
                  }"
                  (click)="toggleDropdown(i, 'showReturn')"
                  *ngIf="!segment.get('uiState.showReturn')?.value"
                  class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 cursor-pointer"
                >
                  <div class="text-xl font-semibold text-gray-800">{{ segment.get('returnDate')?.value | date: 'dd' }}</div>
                  <div class="h-8 w-px bg-gray-300"></div>
                  <div class="min-w-0 leading-tight">
                    <p class="text-sm font-semibold text-gray-800 mb-0">{{ segment.get('returnDate')?.value | date: 'MMMM' }}</p>
                    <p class="text-xs text-gray-500">
                      {{
                        segment.get('returnDate')?.value
                          | date
                            : 'EEEE,
                                    y'
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 grid gap-4" [ngClass]="searchForm.get('journeyType')?.value !== 2 ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'">
            <button [disabled]="segmentsLength === 6" (click)="addSegment()" *ngIf="searchForm.get('journeyType')?.value === 3" pButton pRipple type="button" class="p-button-outlined flex items-center text-blue-500 font-medium">
              <i class="pi pi-plus mr-2"></i>
              Add More Flight
            </button>

            <div class="w-full flex items-center gap-3">
              <input
                type="text"
                formControlName="carriersCode"
                oninput="this.value = this.value.toUpperCase().replace(/[^a-zA-Z0-9 /]/g, '').trim().substring(0, 11)"
                (keyup)="onInputChange($event)"
                placeholder="Example: BG/EK/TK/QR"
                class="w-full font-bold rounded-lg border border-gray-300 px-4 py-5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div class="w-full flex items-center gap-3">
              <button class="flex h-[54px] w-[54px] items-center justify-center rounded-lg bg-[#E50000] transition hover:bg-[#b70000]">
                <i class="pi pi-search text-xl text-white"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex m-auto">
        <div class="w-3/12 mr-4">
          <div style="display: none" class="flex items-center justify-between gap-4 w-full px-3 mb-2 bg-white border rounded-lg">
            <div class="flex gap-3">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="text-2xl text-red-700" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
              </svg>
              <p class="text-base font-medium">Time Remaining</p>
            </div>
            <h4 class="text-xl font-semibold text-[#E50000]">04:28</h4>
          </div>

          <div class="mb-2 overflow-hidden rounded-md border shadow-md h-fit" *ngIf="user() as loggedInUser">
            <div class="p-3 bg-[#E50000]">
              <h3 class="text-white text-lg mb-0">Contact Us for Details</h3>
            </div>
            <div class="px-5 divide-y">
              <div class="flex items-center gap-2 py-4">
                <div class="inline-flex items-center justify-center text-xl text-white rounded-full bg-[#E50000] w-9 h-9">
                  <span class="text-white">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M16.57 22a2 2 0 0 0 1.43-.59l2.71-2.71a1 1 0 0 0 0-1.41l-4-4a1 1 0 0 0-1.41 0l-1.6 1.59a7.55 7.55 0 0 1-3-1.59 7.62 7.62 0 0 1-1.59-3l1.59-1.6a1 1 0 0 0 0-1.41l-4-4a1 1 0 0 0-1.41 0L2.59 6A2 2 0 0 0 2 7.43 15.28 15.28 0 0 0 6.3 17.7 15.28 15.28 0 0 0 16.57 22zM6 5.41 8.59 8 7.3 9.29a1 1 0 0 0-.3.91 10.12 10.12 0 0 0 2.3 4.5 10.08 10.08 0 0 0 4.5 2.3 1 1 0 0 0 .91-.27L16 15.41 18.59 18l-2 2a13.28 13.28 0 0 1-8.87-3.71A13.28 13.28 0 0 1 4 7.41zM20 11h2a8.81 8.81 0 0 0-9-9v2a6.77 6.77 0 0 1 7 7z"
                      ></path>
                      <path d="M13 8c2.1 0 3 .9 3 3h2c0-3.22-1.78-5-5-5z"></path>
                    </svg>
                  </span>
                </div>
                <a href="tel:{{ loggedInUser?.AgencyContactNo }}" class="text-[#E50000]">{{ loggedInUser?.AgencyContactNo }}</a>
              </div>
            </div>
          </div>

          <div class="w-full p-4 bg-white border rounded-md shadow-md" [ngClass]="{ 'sticky top-20': isFilterSticky }">
            <!-- Accordion -->
            <div class="space-y-3">
              <p-accordion value="0">
                <p-accordion-panel value="1">
                  <p-accordion-header>
                    <ng-template #toggleicon let-active="active">
                      @if (active) {
                        <i class="pi pi-minus"></i>
                      } @else {
                        <i class="pi pi-plus"></i>
                      }
                    </ng-template>
                    <div>
                      <h2 class="text-lg font-semibold text-gray-600">Fare Policy</h2>
                    </div>
                  </p-accordion-header>
                  <p-accordion-content>
                    <div class="space-y-3 text-sm text-gray-700">
                      <label *ngFor="let data of filter_params.fare_type" class="flex items-center gap-2 cursor-pointer">
                        <p-checkbox (change)="newOnFilterChange($event, data, 'fare_type')" value="New York" inputId="ny" />
                        <span class="text-base font-medium">{{ data }}</span>
                      </label>
                    </div>
                  </p-accordion-content>
                </p-accordion-panel>

                <p-accordion-panel value="2">
                  <p-accordion-header>
                    <ng-template #toggleicon let-active="active">
                      @if (active) {
                        <i class="pi pi-minus"></i>
                      } @else {
                        <i class="pi pi-plus"></i>
                      }
                    </ng-template>
                    <div>
                      <h2 class="text-lg font-semibold text-gray-600">Air Craft</h2>
                    </div>
                  </p-accordion-header>
                  <p-accordion-content>
                    <div class="space-y-3 text-sm text-gray-700">
                      <label class="flex items-center gap-2 cursor-pointer" *ngFor="let data of filter_params.aircraft">
                        <p-checkbox value="New York" (change)="newOnFilterChange($event, data, 'aircraft')" inputId="ny" />
                        <span class="text-base font-medium">{{ data }}</span>
                      </label>
                    </div>
                  </p-accordion-content>
                </p-accordion-panel>

                <p-accordion-panel value="3">
                  <p-accordion-header>
                    <ng-template #toggleicon let-active="active">
                      @if (active) {
                        <i class="pi pi-minus"></i>
                      } @else {
                        <i class="pi pi-plus"></i>
                      }
                    </ng-template>
                    <div>
                      <h2 class="text-lg font-semibold text-gray-600">Air Baggage</h2>
                    </div>
                  </p-accordion-header>
                  <p-accordion-content>
                    <div class="space-y-3 text-sm text-gray-700">
                      <label class="flex items-center gap-2 cursor-pointer" *ngFor="let data of filter_params.baggage">
                        <p-checkbox value="New York" inputId="ny" (change)="newOnFilterChange($event, data, 'baggage')" />
                        <span class="text-base font-medium">{{ data }}</span>
                      </label>
                    </div>
                  </p-accordion-content>
                </p-accordion-panel>

                <p-accordion-panel value="4">
                  <p-accordion-header>
                    <ng-template #toggleicon let-active="active">
                      @if (active) {
                        <i class="pi pi-minus"></i>
                      } @else {
                        <i class="pi pi-plus"></i>
                      }
                    </ng-template>
                    <div>
                      <h2 class="text-lg font-semibold text-gray-600">Onward Flight Stops</h2>
                    </div>
                  </p-accordion-header>
                  <p-accordion-content>
                    <div class="space-y-3 text-sm text-gray-700">
                      <label class="flex items-center gap-2 cursor-pointer" *ngFor="let data of filter_params.onward_flight_stops">
                        <p-checkbox value="New York" inputId="ny" (change)="newOnFilterChange($event, data, 'onward_flight_stops')" />
                        <span class="text-base font-medium">{{ data }} Stop</span>
                      </label>
                    </div>
                  </p-accordion-content>
                </p-accordion-panel>

                <p-accordion-panel value="5">
                  <p-accordion-header>
                    <ng-template #toggleicon let-active="active">
                      @if (active) {
                        <i class="pi pi-minus"></i>
                      } @else {
                        <i class="pi pi-plus"></i>
                      }
                    </ng-template>
                    <div>
                      <h2 class="text-lg font-semibold text-gray-600">Return Flight Stops</h2>
                    </div>
                  </p-accordion-header>
                  <p-accordion-content>
                    <div class="space-y-3 text-sm text-gray-700">
                      <label class="flex items-center gap-2 cursor-pointer" *ngFor="let data of filter_params.return_flight_stops">
                        <p-checkbox value="New York" inputId="ny" (change)="newOnFilterChange($event, data, 'return_flight_stops')" />
                        <span class="text-base font-medium">{{ data }} Stop</span>
                      </label>
                    </div>
                  </p-accordion-content>
                </p-accordion-panel>

                <p-accordion-panel value="6">
                  <p-accordion-header>
                    <ng-template #toggleicon let-active="active">
                      @if (active) {
                        <i class="pi pi-minus"></i>
                      } @else {
                        <i class="pi pi-plus"></i>
                      }
                    </ng-template>
                    <div>
                      <h2 class="text-lg font-semibold text-gray-600">Airlines</h2>
                    </div>
                  </p-accordion-header>
                  <p-accordion-content>
                    <div class="space-y-3 text-sm text-gray-700">
                      <label class="flex items-center justify-between gap-4 p-2 rounded hover:bg-gray-50 cursor-pointer" *ngFor="let data of filter_params.airlines">
                        <div class="flex items-center gap-3">
                          <p-checkbox [value]="data.Carrier" inputId="ny" (change)="newOnFilterChange($event, data.Carrier, 'airline_code')"></p-checkbox>
                          <img [src]="getSafeUrl(airLogos[data.Carrier].svg)" alt="img01" class="w-6 h-6 object-contain" />
                          <span>{{ data.Carrier }}</span>
                        </div>
                        <span class="text-right text-gray-800 font-medium">
                          {{ data.Price | number: '1.0-0' }}
                          <sup class="text-xs text-gray-500">{{ currencyValueChange }}</sup>
                        </span>
                      </label>
                    </div>
                  </p-accordion-content>
                </p-accordion-panel>
              </p-accordion>
            </div>
          </div>
        </div>

        <div class="w-9/12 bg-gray-100">
          <!-- <div class="flex justify-between align-bottom mb-3">
                <button (click)="modifySearch()" class="bg-[#E50000] hover:bg-[#cc0000] text-white text-sm md:text-base font-semibold py-2.5 px-6 rounded-full shadow-md transition duration-300 ease-in-out">Modify Search</button>
            </div> -->

          <div class="main-content">
            <div class="flex justify-between items-center bg-white rounded-xl shadow p-4 text-center text-sm mb-2">
              <!-- Cheapest -->
              <div class="w-1/3 cursor-pointer" (click)="sortFlightList('cheapest')">
                <div class="font-semibold text-base">Cheapest</div>
                <div class="text-gray-500 mt-1">
                  From
                  <span class="font-medium text-[#E50000]">{{ currencyValueChange }}{{ cheapestFlight?.TotalPrice }}</span>
                  • {{ cheapestFlight?.Duration }}
                </div>
                <div
                  class="h-[2px] mt-2 w-1/2 mx-auto rounded-sm"
                  [ngClass]="{
                    'bg-[#E50000]': filterActive === 'cheapest',
                    'bg-transparent': filterActive !== 'cheapest',
                  }"
                ></div>
              </div>

              <!-- Divider -->
              <div class="w-px h-10 bg-gray-200"></div>

              <!-- Fastest -->
              <div class="w-1/3 cursor-pointer" (click)="sortFlightList('fastest')">
                <div class="font-semibold text-base">Fastest</div>
                <div class="text-gray-500 mt-1">
                  From
                  <span class="font-medium text-[#E50000]">{{ currencyValueChange }}{{ fastestFlight?.TotalPrice }}</span>
                  • {{ fastestFlight?.Duration }}
                </div>
                <div
                  class="h-[2px] mt-2 w-1/2 mx-auto rounded-sm"
                  [ngClass]="{
                    'bg-[#E50000]': filterActive === 'fastest',
                    'bg-transparent': filterActive !== 'fastest',
                  }"
                ></div>
              </div>

              <!-- Divider -->
              <div class="w-px h-10 bg-gray-200"></div>

              <!-- Total Flights -->
              <div class="w-1/3 text-center font-bold text-lg">
                <div class="font-semibold text-[#E50000]">{{ flightList.length }} Flights found</div>
              </div>
            </div>

            <div class="all-result flightListWrapper">
              <ng-container *ngIf="!showSkeletonLoading">
                <div class="flex flex-col mb-4 bg-white rounded-xl shadow-md hover:shadow-lg single-data" *ngFor="let item of flightList; let i = index">
                  <div class="relative flex flex-col items-stretch gap-3 px-3 py-4 sm:gap-12 sm:flex-row justify-evenly gap-x-5 md:gap-x-8">
                    <div class="absolute right-0 z-20 flex w-1 h-8 -translate-y-1/2 rounded-l top-1/2" style="background-color: #e50000"></div>
                    <div class="w-full">
                      <div>
                        <div class="grid justify-between gap-3 mb-3 gap-y-3 sm:grid-cols-5">
                          <div class="flex self-center gap-3 sm:col-span-2 items-center">
                            <img alt="" loading="lazy" width="66" height="66" decoding="async" data-nimg="1" class="rounded w-[66px] h-[66px]" [src]="getSafeUrl(airLogos[item?.onwardFlights[0]?.marketingCarrierCode].svg)" />
                            <div class="space-y-2">
                              <h6 class="text-base font-semibold mb-1">{{ item?.onwardFlights[0]?.marketingCarrierName }}</h6>
                              <div class="inline-flex">
                                <div class="cursor-pointer flex flex-wrap items-center justify-end gap-2 pb-1 text-xs w-fit text-primary" type="button">
                                  <!-- <span
                                                            class="px-1 py-0.5 font-semibold text-sm inline-flex items-center gap-1 border border-dashed rounded-md border-red-500 text-[#E50000]">

                                                            {{ item?.onwardFlights[0]?.operatingFlightNumber }} -
                                                            {{item?.onwardFlights[0]?.flightNumber}}
                                                        </span> -->
                                  <span class="px-1 py-0.5 font-semibold text-sm inline-flex items-center gap-1 border border-dashed rounded-md border-red-500 text-[#E50000]"> Economy ({{ item?.onwardFlights[0]?.cabinClass }}) </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="grid grid-cols-3 sm:col-span-3 gap-x-3 h-fit">
                            <div class="text-center">
                              <h4 class="text-2xl font-bold mb-0">{{ item?.onwardFlights[0]?.departureTime | date: 'HH:mm' }}</h4>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ item?.onwardFlights[0]?.departureTime | date: 'EEE, dd MMM yyyy' }}</p>
                              <h3 class="text-lg mb-0 mt-0">{{ getAirportName2(item?.onwardFlights[0]?.originAirportName) }}</h3>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ getAirportName(item?.onwardFlights[0]?.originAirportName) }}</p>
                            </div>
                            <div class="inline-flex">
                              <div class="cursor-pointer self-center space-y-1 text-center" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r1u:" data-state="closed">
                                <div class="flex items-center justify-center gap-1 text-xs text-neutral whitespace-nowrap">
                                  <span class="text-sm text-gray-400">{{ item?.journeyDurations[0]?.totalDuration }}</span>
                                </div>
                                <!-- <div
                                                        class="relative min-w-full flex items-center justify-between w-32 before:absolute before:left-0 before:w-full before:h-0.5 before:z-[1] before:bg-gray-200 before:flex">
                                                        <span class="flex w-2 h-2 bg-primary/10 z-[2]"></span><span
                                                            class="flex w-2 h-2 bg-primary/10 z-[2]"></span>
                                                    </div> -->
                                <div>
                                  <img src="assets/img/layover-non-stop.svg" alt="" />
                                </div>
                                <p class="text-sm text-gray-400">
                                  {{ item?.journeyDurations[0]?.stopCount ? item?.journeyDurations[0]?.stopCount + 'Stop' : 'Direct Flight' }}
                                </p>
                              </div>
                            </div>
                            <div class="text-center">
                              <h4 class="text-2xl font-bold mb-0">{{ item?.onwardFlights[0]?.arrivalTime | date: 'HH:mm' }}</h4>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ item?.onwardFlights[0]?.arrivalTime | date: 'EEE, dd MMM yyyy' }}</p>
                              <h3 class="text-lg mb-0 mt-0">{{ getAirportName2(item?.onwardFlights[item?.onwardFlights.length - 1]?.destinationAirportName) }}</h3>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ getAirportName(item?.onwardFlights[item?.onwardFlights.length - 1]?.destinationAirportName) }}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div *ngIf="item?.returnFlights?.length">
                        <hr class="my-4 border" />
                        <div class="grid justify-between gap-3 mb-3 gap-y-3 sm:grid-cols-5">
                          <div class="flex self-center gap-3 sm:col-span-2">
                            <img alt="" loading="lazy" width="66" height="66" decoding="async" data-nimg="1" class="rounded w-[66px] h-[66px]" [src]="getSafeUrl(airLogos[item?.returnFlights[0]?.marketingCarrierCode].svg)" />
                            <div class="space-y-2">
                              <h6 class="text-base font-semibold mb-1">{{ item?.returnFlights[0]?.marketingCarrierName }}</h6>
                              <div class="inline-flex">
                                <div class="cursor-pointer flex flex-wrap items-center justify-end gap-2 pb-1 text-xs w-fit text-primary" type="button">
                                  <!-- <span
                                                            class="px-1 py-0.5 font-semibold text-sm inline-flex items-center gap-1 border border-dashed rounded-md border-red-500 text-[#E50000]">
                                                            {{ item?.returnFlights[0]?.operatingFlightNumber }} -
                                                            {{item?.returnFlights[0]?.operatingFlightNumber}}
                                                        </span> -->
                                  <span class="px-1 py-0.5 font-semibold text-sm inline-flex items-center gap-1 border border-dashed rounded-md border-red-500 text-[#E50000]"> Economy ({{ item?.returnFlights[0]?.cabinClass }}) </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="grid grid-cols-3 sm:col-span-3 gap-x-3 h-fit">
                            <div class="text-center">
                              <h4 class="text-2xl font-bold mb-0">{{ item?.returnFlights[0]?.departureTime | date: 'HH:mm' }}</h4>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ item?.returnFlights[0]?.departureTime | date: 'EEE, dd MMM yyyy' }}</p>
                              <h3 class="text-lg mb-0 mt-0">{{ getAirportName2(item?.returnFlights[0]?.originAirportName) }}</h3>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ getAirportName(item?.returnFlights[0]?.originAirportName) }}</p>
                            </div>
                            <div class="inline-flex">
                              <div class="cursor-pointer self-center space-y-1 text-center" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r1u:" data-state="closed">
                                <div class="flex items-center justify-center gap-1 text-xs text-neutral whitespace-nowrap">
                                  <span class="text-sm text-gray-400">{{ item?.journeyDurations[1]?.totalDuration }}</span>
                                </div>
                                <div>
                                  <img src="assets/img/layover-non-stop.svg" alt="" />
                                </div>
                                <!-- <div
                                                        class="relative min-w-full flex items-center justify-between w-32 before:absolute before:left-0 before:w-full before:h-0.5 before:z-[1] before:bg-gray-200 before:flex">
                                                        <span class="flex w-2 h-2 bg-primary/10 z-[2]"></span><span
                                                            class="flex w-2 h-2 bg-primary/10 z-[2]"></span>
                                                    </div> -->
                                <p class="text-sm text-gray-400">
                                  {{
                                    item?.journeyDurations[1]?.stopCount
                                      ? item?.journeyDurations[1]?.stopCount + 'Stop'
                                      : 'Direct
                                                            Flight'
                                  }}
                                </p>
                              </div>
                            </div>
                            <div class="text-center">
                              <h4 class="text-2xl font-bold mb-0">{{ item?.returnFlights[0]?.arrivalTime | date: 'HH:mm' }}</h4>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ item?.returnFlights[0]?.arrivalTime | date: 'EEE, dd MMM yyyy' }}</p>
                              <h3 class="text-lg mb-0 mt-0">{{ getAirportName2(item?.returnFlights[item?.returnFlights.length - 1]?.destinationAirportName) }}</h3>
                              <p class="text-sm text-gray-400 mb-0 mt-0">{{ getAirportName(item?.returnFlights[item?.returnFlights.length - 1]?.destinationAirportName) }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mt-0 items-center self-stretch justify-end sm:p-4 sm:rounded-md bg-red-50 max-sm:w-full sm:flex">
                      <div class="flex items-center justify-between text-center sm:flex-col">
                        <div class="flex flex-col items-end justify-center gap-1 mb-1">
                          <h4 class="text-lg font-semibold mb-0 mt-0">
                            {{ currencyValueChange }}
                            {{ item?.TotalPrice }}
                          </h4>
                        </div>
                        <button (click)="showItineraryModal(item)" class="min-h-0 font-normal w-[110px] justify-center tracking-wider normal-case rounded-md flex-nowrap h-9 bg-[#E50000] hover:bg-[#cc0000] text-white transition-colors duration-200 flex items-center gap-1 p-2">
                          <i class="pi pi-check-circle"></i>
                          <span>Select</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr class="m-0" />
                  <div class="flex items-center justify-between">
                    <!-- <button (click)="toggleFlightDetail(i, item)"
                                class="px-3 py-2 text-[12px] flex items-center gap-1 text-base text-gray-400 mb-0 mt-0">
                                {{
                                item?.IsRefundable
                                ? 'Refundable'
                                : 'Non
                                Refundable'
                                }}<i class="pi pi-angle-down"></i></button> -->
                    <div class="flex h-fit flex-wrap justify-between gap-2 text-xs ml-4">
                      <div class="flex h-fit flex-wrap gap-2">
                        <div class="flex items-center gap-2 rounded-full bg-brand-tint px-2 py-1 font-medium text-brand-1">
                          <div class="relative h-4 w-4"><img alt="image" src="assets/img/currency.svg" /></div>
                          <p>
                            {{
                              item?.IsRefundable
                                ? 'Refundable'
                                : 'Non
                                                Refundable'
                            }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 rounded-full border border-brand-1 bg-brand-tint px-2 py-0.5 font-medium text-brand-1">
                        <div class="relative h-[14px] w-3"><img alt="image" src="assets/img/seat.svg" /></div>
                        <p>{{ journeyType == 3 ? item?.returnFlights[0][0]?.bookingAvailability : item?.returnFlights[0]?.bookingAvailability }} seat(s) left</p>
                      </div>
                    </div>
                    <button (click)="toggleFlightDetail(i, item)" class="px-3 py-3 text-[16px] flex items-center gap-1 font-semibold text-[#E50000] m-0">
                      Flight Details
                      <i [ngClass]="openIndex === i ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
                    </button>
                  </div>
                </div>
              </ng-container>

              <ng-container *ngIf="showSkeletonLoading">
                <div class="animate-pulse p-6 bg-white rounded shadow flex gap-6" *ngFor="let _ of [1, 2, 3, 4, 5]">
                  <!-- Left Table Section -->
                  <div class="flex-1">
                    <div class="space-y-6">
                      <!-- Row (repeat as needed) -->
                      <div class="flex items-start gap-6">
                        <!-- Avatar Circle -->
                        <div class="w-10 h-10 bg-gray-300 rounded-full"></div>

                        <!-- Text Columns -->
                        <div class="flex-1 grid grid-cols-4 gap-4">
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-24"></div>
                            <div class="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-28"></div>
                            <div class="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-20"></div>
                            <div class="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-16"></div>
                            <div class="h-3 bg-gray-200 rounded w-12"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Repeat row 2 -->
                      <div class="flex items-start gap-6">
                        <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div class="flex-1 grid grid-cols-4 gap-4">
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-24"></div>
                            <div class="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-28"></div>
                            <div class="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-20"></div>
                            <div class="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div class="space-y-2">
                            <div class="h-3 bg-gray-300 rounded w-16"></div>
                            <div class="h-3 bg-gray-200 rounded w-12"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Add more rows if needed -->
                    </div>

                    <!-- Footer -->
                    <div class="flex justify-end gap-4 mt-8">
                      <div class="w-16 h-6 bg-gray-200 rounded"></div>
                      <div class="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <!-- Right Sidebar -->
                  <div class="w-52 flex flex-col gap-4 bg-gray-100 p-4 rounded">
                    <div class="h-3 w-32 bg-gray-300 rounded"></div>
                    <div class="h-3 w-28 bg-gray-200 rounded"></div>
                    <div class="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </ng-container>
            </div>

            <div class="error-message-section h-full" *ngIf="!flightList.length && !showSkeletonLoading">
              <div class="error-img">
                <img src="assets/images/4.svg" alt="" style="width: 35%" />
              </div>
              <div class="error-content">
                <h3>Unfortunately, we couldn't find any flights for you!</h3>
                <p>No flights match your filters. Please adjust your search criteria and try again. Good Luck!</p>
                <!-- <button (click)="modifySearch()" class="btn">Modify Search</button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p-dialog [(visible)]="isShowItineraryModal" [style]="{ width: '100%', maxWidth: '1100px' }" header="Flight Itinerary" [modal]="true" [closable]="true" [dismissableMask]="true">
      <div class="parent">
        <!-- Email Header -->
        <div class="flex gap-2 mb-4">
          <input type="text" placeholder="Email Subject" class="border border-gray-300 px-4 py-2 rounded w-1/3" />
          <input type="email" placeholder="Email Address" class="border border-gray-300 px-4 py-2 rounded w-1/3" />
          <button pButton type="button" label="Send Email" icon="pi pi-envelope" class="bg-blue-600 text-white px-4 py-2 rounded" (click)="sendEmail()"></button>
          <!-- This will run your function first -->
          <button (click)="printTicket()" class="p-button p-component p-button-outlined p-button-secondary">
            <span class="pi pi-print p-button-icon"></span>
            <span class="p-button-label">Print</span>
          </button>

          <!-- Hidden print trigger -->
          <button #printBtn ngxPrint [printSectionId]="'ticket-content'" style="display: none"></button>

          <p-button (onClick)="toggleFareInfo()" [icon]="isShowFare ? 'pi pi-eye-slash' : 'pi pi-eye'" [label]="isShowFare ? 'Hide Fare' : 'Show Fare'" severity="warn" variant="outlined"></p-button>
        </div>

        <!-- Itinerary -->
        <div id="ticket-content">
          <!-- <h2
                style="background-color: #f3f4f6; font-weight: 600; font-size: 1.125rem; padding: 0.5rem 1rem; margin-bottom: 0">
                Itinerary-Option 1</h2> -->
          <div style="overflow-x: auto">
            <table style="min-width: 100%; table-layout: auto; font-size: 0.875rem; border-collapse: collapse">
              <thead style="background-color: #e50000; color: white">
                <tr>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Airlines / Flight No</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">From</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Departure Date & Time</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">To</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Arrival Date & Time</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Duration</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Aircraft</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Baggage</th>
                </tr>
              </thead>
              <tbody style="text-align: center">
                <tr *ngFor="let item of selectedItinerary?.onwardFlights" style="border-top: 1px solid #ddd">
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <img [src]="getSafeUrl(airLogos[item.Carrier].svg)" alt="Air India" style="height: 2rem; display: block; margin: 0 auto 0.25rem auto" />
                    <div>
                      {{ item?.OperatingCarrierName }}
                      <br />
                      <br />
                      Economy({{ item?.BookingCode }})
                    </div>
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{ item?.Origin }}
                    <br />
                    {{ getAirportName(item?.OriginAirPortName) }},
                    <br />
                    {{ getAirportName2(item?.OriginAirPortName) }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{
                      item?.DepartureTime
                        | date
                          : 'MMM d,
                                y, HH:mm'
                    }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{ item?.Destination }}
                    <br />
                    {{ getAirportName(item?.destinationAirportName) }},
                    <br />
                    {{ getAirportName2(item?.destinationAirportName) }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{
                      item?.ArrivalTime
                        | date
                          : 'MMM d, y,
                                HH:mm'
                    }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">{{ item?.TravelDuration }}</td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">{{ item?.Equipment }}</td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">{{ item?.AirBaggageAllowance }}</td>
                </tr>

                <tr *ngFor="let item of selectedItinerary?.returnFlights" style="border-top: 1px solid #ddd">
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <img [src]="getSafeUrl(airLogos[item.Carrier].svg)" alt="Air India" style="height: 2rem; display: block; margin: 0 auto 0.25rem auto" />
                    <div>
                      {{ item?.OperatingCarrierName }}
                      <br />
                      <br />
                      Economy({{ item?.BookingCode }}).sv
                    </div>
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{ item?.Origin }}
                    <br />
                    {{ getAirportName(item?.OriginAirPortName) }},
                    <br />
                    {{ getAirportName2(item?.OriginAirPortName) }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{
                      item?.DepartureTime
                        | date
                          : 'MMM d,
                                y, HH:mm'
                    }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{ item?.Destination }}
                    <br />
                    {{ getAirportName(item?.destinationAirportName) }},
                    <br />
                    {{ getAirportName2(item?.destinationAirportName) }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{
                      item?.ArrivalTime
                        | date
                          : 'MMM d, y,
                                HH:mm'
                    }}
                  </td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">{{ item?.TravelDuration }}</td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">{{ item?.Equipment }}</td>
                  <td style="padding: 0.5rem; border: 2px solid #ddd">{{ item?.AirBaggageAllowance }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fare Details -->
          <div style="margin-top: 1rem" *ngIf="isShowFare">
            <div class="flex items-center justify-between bg-gray-100 text-gray-800 px-4 py-2 rounded-t mb-2">
              <h3 class="text-lg font-semibold m-0">Fare Details</h3>

              <button *ngIf="isShowEditButton" (click)="isEditMode = !isEditMode" id="no-print" class="no-print flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E50000] hover:bg-[#cc0000] rounded-md transition">
                <i class="pi" [ngClass]="isEditMode ? 'pi-check-square' : 'pi-pencil'"></i>
                {{ isEditMode ? 'Save Fare' : 'Edit Fare' }}
              </button>
            </div>

            <table style="min-width: 100%; table-layout: auto; font-size: 0.875rem; border-collapse: collapse; border-top: 1px solid #ccc; font-family: sans-serif; text-align: center">
              <thead style="background-color: #e50000; color: white">
                <tr style="border-left: 2px solid white; border-right: 2px solid white">
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Type</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Base</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Taxes</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Discount</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Pax</th>
                  <th style="padding: 0.5rem; border: 2px solid #ddd">Sub Total</th>
                </tr>
              </thead>

              <tbody *ngFor="let item of selectedItinerary?.FareBreakdown; let i = index">
                <tr style="border-top: 1px solid #ddd">
                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    {{ item?.PassengerType }}
                  </td>

                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <ng-container *ngIf="isEditMode; else baseFareText">
                      <p-inputNumber
                        name="baseFare{{ i }}"
                        [(ngModel)]="item.BaseFare"
                        (onInput)="recalculateTotalFare(i)"
                        mode="decimal"
                        inputStyleClass="text-right"
                        styleClass="w-full flex justify-center"
                        [inputStyle]="{
                          width: '100px',
                          textAlign: 'right',
                          padding: '0.3rem 0.5rem',
                          fontSize: '14px',
                          borderRadius: '6px',
                        }"
                      ></p-inputNumber>
                    </ng-container>
                    <ng-template #baseFareText>
                      {{ item.BaseFare }}
                    </ng-template>
                  </td>

                  <!-- Repeat same structure for the rest of the fields -->

                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <ng-container *ngIf="isEditMode; else totalTaxText">
                      <p-inputNumber
                        name="totalTax{{ i }}"
                        [(ngModel)]="item.TotalTax"
                        (onInput)="recalculateTotalFare(i)"
                        mode="decimal"
                        inputStyleClass="text-right"
                        styleClass="w-full flex justify-center"
                        [inputStyle]="{
                          width: '100px',
                          textAlign: 'right',
                          padding: '0.3rem 0.5rem',
                          fontSize: '14px',
                          borderRadius: '6px',
                        }"
                      ></p-inputNumber>
                    </ng-container>
                    <ng-template #totalTaxText>
                      {{ item.TotalTax }}
                    </ng-template>
                  </td>

                  <!-- Continue similar for ApiDiscount and NoOfPassenger -->

                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <ng-container *ngIf="isEditMode; else apiDiscountText">
                      <p-inputNumber
                        name="apiDiscount{{ i }}"
                        [(ngModel)]="item.ApiDiscount"
                        (onInput)="recalculateTotalFare(i)"
                        mode="decimal"
                        inputStyleClass="text-right"
                        styleClass="w-full flex justify-center"
                        [inputStyle]="{
                          width: '100px',
                          textAlign: 'right',
                          padding: '0.3rem 0.5rem',
                          fontSize: '14px',
                          borderRadius: '6px',
                        }"
                      ></p-inputNumber>
                    </ng-container>
                    <ng-template #apiDiscountText>
                      {{ item.ApiDiscount }}
                    </ng-template>
                  </td>

                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <ng-container>
                      {{ item.NoOfPassenger }}
                    </ng-container>
                  </td>

                  <td style="padding: 0.5rem; border: 2px solid #ddd">
                    <strong>BDT {{ item.TotalFare }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: right; padding: 0.5rem 1rem; font-weight: 600; color: #1f2937">Grand Total : BDT {{ getTotalPrice() | number: '1.0-2' }}</div>
          </div>

          <!-- Disclaimer -->
          <p style="font-size: 0.75rem; color: #dc2626; padding: 0 1rem 1rem 1rem">Disclaimer : The above mentioned quotation is subject to the availability of seats. It may change anytime before booking. Please forward your passport and visa copy for confirmed booking.</p>
        </div>
      </div>
    </p-dialog>
  `,
})
export class Dashboard {
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
