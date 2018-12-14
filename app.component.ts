import { Store } from '@ngrx/store'
import { Component, Renderer } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Observable } from "rxjs";
import { PromoModel, UserModel, AppState } from "./data-store";
import * as UserActions from './data-store/user-data/user.action';
import * as PromoActions from './data-store/promo-data/promo.action';
import { BaseComponent } from "./base.component";
import { ErrorService } from './utils';

@Component({
  selector: 'app',
  template: require('./views/app.view.html')
})
export class AppComponent extends BaseComponent {
  contentElement: any;
  currentRoute: string;
  errorState: boolean = false;

  constructor( private store: Store<AppState>,
               private router: Router,
               private errorService: ErrorService ) {
    super();

    this.subscribeToModelUpdates();
    this.setInitialUserState();
    this.handleRouteChanges();
    this.storeCurrentRoute();
  }

  private handleRouteChanges(): void {
    this.router.events
      .subscribe(
        ( route ) => {
          this.currentRoute = route['url'].replace(/^\//, '').replace(/\//g, '-');
          this.errorState = route['url'].match(/^\/jic\//) !== null;

          document.body.setAttribute('data-page', this.currentRoute);
        },
        ( error ) => {
          this.errorService.logError(
            { app: { handleRouteChanges: error } }
          );
        });
  }

  private storeCurrentRoute(): void {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(( event: NavigationEnd ) => {
        let currentUrl = event['urlAfterRedirects'].substring(1).replace('/', '-');
        this.store.dispatch(new PromoActions.UpdatePromoInfo({ currentPage: currentUrl }));
      });
  }

  private subscribeToModelUpdates(): void {
    this.model = Observable.combineLatest(
      this.store.select('user'),
      this.store.select('promo'),
      ( user: UserModel, promo: PromoModel ) => {
        return {
          user: { first_name: user.first_name },
          promo: promo
        }
      }
    );
  }

  private setInitialUserState(): void {
    let userData = {
      ...window.profile_data,
      first_name: window.profile_data.first_name,
      last_name: window.profile_data.last_name,
      address1: window.profile_data.address1,
      address2: window.profile_data.address2,
      city: window.profile_data.city,
      state: window.profile_data.state,
      zip: window.profile_data.zip,
      email: window.profile_data.email,
      emailDOI: window.profile_data.email_doi,
      emailSubscription: window.profile_data.email_subscription,
      emailContactable: window.profile_data.email_contactable,
      mDOI: window.profile_data.mdoi,
      is_limited: window.plays_left <= 0,
      profile_id: this.checkForProfile(window.pid),
      state_allowed: window.is_state_allowed,
    };
    this.store.dispatch(new UserActions.UpdateUserInfo(userData));
  }

  private setInitialPromoState(): void {
    const initPromoData: PromoModel = {
      currentPhase: custom['lifecycle'],
      currentDay: custom['current_day'],
      currentWeek: custom['current_week'],
      daysLeft: custom['days_left'],
      releaseVersion: custom['releaseVersion'],
      lifecycle: custom['lifecycle'],
    };
    this.store.dispatch(new PromoActions.UpdatePromoInfo(initPromoData));
  }

  private checkForProfile( pid: string ): void {
    if (
      pid === "."
      && this.isActiveLifecycle()
    ) {
      this.errorService.throwCriticalError('pid empty');
    }
  }

  private isActiveLifecycle(): boolean {
    return custom['lifecycle'].match(/^(week|testing|launched|phase1)/i) !== null
  }

  ngOnInit(): void {
    this.setInitialPromoState();
    this.checkModalVisibility();
  }

}