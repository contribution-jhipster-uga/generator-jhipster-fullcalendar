import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import dayGridPlugin from '@fullcalendar/daygrid';

import { EventModalComponent } from './event-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CalendarService } from 'app/entities/fullcalendar/calendar.service';
import { ICalendar } from 'app/shared/model/calendar.model';
import { ICalendarEvent } from 'app/shared/model/calendar-event.model';
import { CalendarEventService } from 'app/entities/fullcalendar-event/calendar-event.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';

@Component({
  selector: 'jhi-calendars',
  templateUrl: './calendars.component.html'
})
export class CalendarsComponent implements OnInit, OnDestroy {
  calendarList: ICalendar[];
  calendarEvents: ICalendarEvent[];
  displayedEvents: {}[];
  checkedCals: { calid?: number; checked: boolean }[];
  eventSubscriber?: Subscription;
  calendarSubscriber?: Subscription;
  calendarPlugins = [dayGridPlugin];
  account: Account | null = null;
  authSubscription?: Subscription;

  constructor(
    private accountService: AccountService,
    protected calendarService: CalendarService,
    protected calendarEventService: CalendarEventService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected eventManager: JhiEventManager,
    protected EventModalService: NgbModal
  ) {
    this.displayedEvents = [];
    this.checkedCals = [];
    this.calendarEvents = [];
    this.calendarList = [];
  }

  loadAll(): void {
    this.calendarService.query().subscribe((res: HttpResponse<ICalendar[]>) => this.onCalendarSuccess(res.body));
    this.calendarEventService.query().subscribe((res: HttpResponse<ICalendarEvent[]>) => this.onCalendarEventSuccess(res.body));
  }

  ngOnInit(): void {
    this.loadAll();
    this.calendarSubscriber = this.eventManager.subscribe('calendarsModification', () => this.loadAll());
    this.eventSubscriber = this.eventManager.subscribe('calendarEventListModification', () => this.loadAll());
    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => (this.account = account));
  }

  ngOnDestroy(): void {
    if (this.calendarSubscriber) this.eventManager.destroy(this.calendarSubscriber);
    if (this.eventSubscriber) this.eventManager.destroy(this.eventSubscriber);
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.accountService.isAuthenticated();
  }

  protected onCalendarSuccess(data: ICalendar[] | null): void {
    this.calendarList = data || [];
    this.checkedCals = [];
    this.calendarList.forEach(c => {
      this.checkedCals.push({ calid: c.id, checked: true });
    });
  }

  protected onCalendarEventSuccess(data: ICalendarEvent[] | null): void {
    this.calendarEvents = data || [];
    this.displayedEvents = [];
    this.calendarEvents.forEach(e => this.checkEvent(e));
  }

  /** Convert an ICalendarEvent Object to a FullCalendar Event Object */
  protected parseEvent(event: ICalendarEvent): {} {
    const r = {};
    if (event.uid) r['id'] = event.uid;
    if (event.title) r['title'] = event.title;
    if (event.startDate) r['start'] = event.startDate.toISOString();
    if (event.endDate) r['end'] = event.endDate.toISOString();
    else r['allDay'] = true;
    if (event.url) r['url'] = event.url;
    return r;
  }

  protected checkEvent(e: ICalendarEvent): void {
    if (this.account) {
      if (e.calendarId && (e.isPublic || e.createdById === this.account.id)) this.displayedEvents.push(this.parseEvent(e));
    } else {
      if (e.calendarId && e.isPublic) this.displayedEvents.push(this.parseEvent(e));
    }
  }

  protected eventsToDisplay(cid: number, event: any): void {
    this.displayedEvents = [];
    this.checkedCals.find(c => c.calid === cid)!.checked = event.target.checked;
    this.checkedCals.forEach(c => {
      if (c.checked) {
        const e = this.calendarEvents.filter(f => f.calendarId === c.calid);
        e.forEach(ev => this.checkEvent(ev));
      }
    });
  }

  handleEventClick(info: any): void {
    const modalRef = this.EventModalService.open(EventModalComponent);
    // console.log(this.calendarEvents.find(e => e.uid === info.event._def.publicId));
    modalRef.componentInstance.eventObject = this.calendarEvents.find(e => e.uid === info.event._def.publicId);
  }
}
