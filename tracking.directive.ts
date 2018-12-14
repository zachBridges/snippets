import { Directive, Input } from '@angular/core';
import { TrackingService } from './tracking.service';
import { ErrorService } from './error.service';
import { TrackingObject } from '../data-store/tracking-data/tracking-object.class';
import { BaseComponent } from '../base.component';

declare let window: any;
declare let _satellite: any;
declare let digitalData: any;

@Directive({
  selector: '[track]',
  host: {
    '(click)': 'onClick($event)'
  }
})

export class TrackingDirective extends BaseComponent {
  @Input() track: TrackingObject;

  constructor( private trackingService: TrackingService, private errorService: ErrorService ) {
    super();
  }

  public onClick( event: Event ) {
    // Prevent links within labels from firing 2 tracking pixels
    event.stopPropagation();
    let clickTrackingObject: TrackingObject = this.trackingService.buildTrackingObject(this.track);
    this.trackingService.doTracking(clickTrackingObject);
  }
}