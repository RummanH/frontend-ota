import { computed, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TicketService {
    private _ticketData = signal<any>(null);
    private _baggageData = signal<any>(null);
    public ticketData = computed(() => this._ticketData());
    public baggageData = computed(() => this._baggageData());

    setTicketData(data: any) {
        this._ticketData.set(data);
    }

    setBaggageData(data: any) {
        this._baggageData.set(data);
    }

    constructor() {}
}
