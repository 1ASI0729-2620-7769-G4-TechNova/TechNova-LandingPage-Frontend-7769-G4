import {Component, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {TrackingStore} from '../../../application/tracking.store';

/**
 * Notifications of the signed-in user about the stage of their orders, newest first.
 */
@Component({
  selector: 'app-notification-list',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css'
})
export class NotificationList {
  protected readonly store = inject(TrackingStore);
}
