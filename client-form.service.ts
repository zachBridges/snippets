import { Injectable, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { RestService } from '@custom/utilities'

import { ErrorService } from './error.service';
import { Constants } from '../data-store';

declare const window: any;

@Injectable()
export class FormService {

  constructor( private domSanitizer: DomSanitizer,
               private errorService: ErrorService,
               private restService: RestService,
               private router: Router,
               private zone: NgZone ) {
  }

  setEvent(): Observable<any> {
    return Observable.create(observer => {
      window.formCallback = function ( payload ) {
        const { StatusCode, StatusMessage } = payload;
        observer.next({ StatusCode, StatusMessage })
      }
    })
  }

  getForm( TemplateID: string, CallbackMethod: string ): any {
    return this.restService.makeHwCall('GET_FORM', {
      TemplateID,
      CallbackMethod
    })
        .map(( res: any ) => {
          if (!this.isResponseValid(res['form']) && (!Constants.IS_DEV)) {
            const error: string = `could not load form with  ID, ${TemplateID}. response: ${res}`;
            this.errorService.logError(error);
            this.router.navigateByUrl('jic/formerror');
          }
          return this.domSanitizer.bypassSecurityTrustHtml(res.form)
        })
  }

  navigateToExplore(): void {
    this.zone.run(() => {
      this.router.navigateByUrl('explore');
    });
  }

  navigateToThanks(): void {
    this.zone.run(() => {
      this.router.navigate(['/thanks']);
    });
  }

  isSuccessResponse( statusCode: string ): boolean {
    return statusCode === Constants.SUBMIT__RESPONSE_CODE['SUCCESS'];
  }

  isErrorResponse( statusCode: string ): boolean {
    let errorCodes = [
      Constants.SUBMIT__RESPONSE_CODE['INVALID_ACCESS_TOKEN'],
      Constants.SUBMIT__RESPONSE_CODE['EXPIRED_ACCES_TOKEN'],
      Constants.SUBMIT__RESPONSE_CODE['INVALID_TOKEN'],
      Constants.SUBMIT__RESPONSE_CODE['EXPIRED_TOKEN'],
      Constants.SUBMIT__RESPONSE_CODE['REQUEST_FAILED'],
    ];
    return errorCodes.indexOf(statusCode) >= 0;
  }

  isEmailValidationResponse( statusCode: string ): boolean {
    /*
    * TODO:
    * this doesn't fire via window.formCallback
    * if this is to work, need to identify whats handles
    *   submitting this
    */

    let validationErrorCodes = [
      Constants.SUBMIT__RESPONSE_CODE['INVALID_EMAIL_ADDRESS']
    ];
    return validationErrorCodes.indexOf(statusCode) >= 0;
  }

  private isResponseValid( form: string ): boolean {
    let hasOpeningFormTag: boolean = false;
    let hasClosingFormTag: boolean = false;
    if( form !== null ) {
      hasOpeningFormTag = form.match(/<form>/) !== null;
      hasClosingFormTag = form.match(/<\/form>/) !== null;
    }
    return hasOpeningFormTag && hasClosingFormTag;
  }


}