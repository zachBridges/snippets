import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState, UserModel, PromoModel } from '../data-store';

@Injectable()
export class LifecycleGuard implements CanActivate {

  isAllowed: boolean = false;
  isIneligible: boolean = false;
  lifecycle: string;

  constructor( private store: Store<AppState>, private router: Router ) {
    Observable.combineLatest(
      store.select('user'),
      store.select('promo'),
      ( user: UserModel, promo: PromoModel ) => {
        return {
          user,
          promo
        }
      })
      .subscribe(
        ( data ) => {
          this.isIneligible = !data['user']['state_allowed'];
          this.lifecycle = this.getCorrectedRouteName(data['promo']['lifecycle']);
          this.isAllowed = this.lifecycle.match(/^(week|testing|launched|phase1)/) !== null && !this.isIneligible;
        }
      )
  }

  canActivate() {
    if (!this.isAllowed) {
      this.router.navigateByUrl(`/jic/${this.lifecycle}`)
        .catch(() => {
          console.error("not able to reach route");
        });
    }
    return this.isAllowed;
  }

  private getCorrectedRouteName( lifecycle: string ): string {
    if (lifecycle === 'promoover' || lifecycle === 'expired') {
      return 'expired';
    } else if (this.isIneligible && lifecycle !== 'pre-launch') {
      return 'mamiva';
    }
    return lifecycle;
  }
}