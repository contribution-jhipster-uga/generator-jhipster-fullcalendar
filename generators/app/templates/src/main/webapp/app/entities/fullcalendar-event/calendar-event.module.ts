import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

//<--! import -->
import { CalendarEventComponent } from './calendar-event.component';
import { CalendarEventDetailComponent } from './calendar-event-detail.component';
import { CalendarEventUpdateComponent } from './calendar-event-update.component';
import { CalendarEventDeleteDialogComponent } from './calendar-event-delete-dialog.component';
import { calendarEventRoute } from './calendar-event.route';

@NgModule({
  //<--! sharedmodule -->
  declarations: [CalendarEventComponent, CalendarEventDetailComponent, CalendarEventUpdateComponent, CalendarEventDeleteDialogComponent],
  entryComponents: [CalendarEventDeleteDialogComponent]
})
export class FullCalendarCalendarEventModule {}
