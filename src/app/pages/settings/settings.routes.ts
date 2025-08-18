import { Routes } from '@angular/router';
import { ApiConfigurationComponent } from './api-configuration/api-configuration.component';
import { PnrSearchComponent } from './pnr-search/pnr-search.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketTemplatesComponent } from './ticket-templates/ticket-templates.component';

export default [
    { path: 'configurations', component: ApiConfigurationComponent },
    { path: 'choose-templates', component: TicketTemplatesComponent },
    { path: 'pnr-retrieve', component: PnrSearchComponent },
    { path: 'ticket', component: TicketComponent }
] as Routes;
