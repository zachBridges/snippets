import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState, Constants } from "../data-store";
import * as PromoActions from '../data-store/promo-data/promo.action';
import * as UserActions from '../data-store/user-data/user.action';
import { HwErrorService, ViewportService } from './';
import { RestService } from '@custom/utilities';

@Injectable()
export class LoyaltyService {

  showLoyaltyContent: boolean = false;
  loyaltyStatus: string;

  constructor( private store: Store<AppState>,
               private errorService: HwErrorService,
               private restService: RestService,
               private viewportService: ViewportService) {
    this.loyaltyStatus = Constants.LOYALTY_DATA['LOYALTY_STATUS'];
    this.shouldLoyaltyBannerBeDisplayed();
  }

  shouldLoyaltyBeDisplayed(): boolean {
    if (Constants.LOYALTY_DATA['HAS_ACTIVE_LOYALTY'] == '1') {
      if (this.showEnrollBanner()) {
        return true;
      } else if (this.showEligibleBanner()) {
        return true;
      }
    }
    return false;
  }

  showEnrollBanner(): boolean {
    return Constants.LOYALTY_DATA['ENROLL_BANNER_DISMISSED'] != '1' && this.getLoyaltyStatus() === 'ENROLLED';
  }

  showEligibleBanner(): boolean {
    return Constants.LOYALTY_DATA['ELIGIBLE_BANNER_DISMISSED'] != '1' && this.getLoyaltyStatus() === 'ELIGIBLE';
  }


  shouldLoyaltyBannerBeDisplayed(): void {
    if (this.shouldLoyaltyBeDisplayed() && Constants.LOYALTY_DATA['ENROLL_BANNER_DISMISSED'] != '1') {
      const userData = { isLoyaltyBannerDisplayed: true };
      this.store.dispatch(new UserActions.UpdateUserInfo(userData));
    }
  }

  getLoyaltyStatus(): string {
    return this.loyaltyStatus.toUpperCase();
  }

  doesUserHaveActiveLoyalty(): boolean{
    return Constants.LOYALTY_DATA['HAS_ACTIVE_LOYALTY'] == '1';
  }

  public earnLoyalty(): any {
    return this.restService.makeCall('EARN_LOYALTY', {code_key: "FIRST_ENTRY"})
      .subscribe(
        data => {
          if(data['status'] == 200){
            this.store.dispatch(new PromoActions.UpdatePromoInfo({loyaltyPointsAwarded: true}));
          }
          else{
            this.errorService.logError(data);
            this.store.dispatch(new PromoActions.UpdatePromoInfo({loyaltyPointsAwarded: false}));
          }
        },
        err => {
          this.errorService.logError(err);
        }
      );
  }


}