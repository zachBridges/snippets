/*
  This component consumed a form module which would 
  be passed a config (see: getFormFields )
  and the module would spit out the form we wanted, along with 
  all of the controls we needed.

  See field.view.html and field.component.ts (they were pieces of the form module)
*/

import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';

import { RestService } from '@custom/utilities';
import {
  FieldBase,
  DropdownField,
  TextField,
  FieldControlService,
  validateAddress,
  validateCity,
  validateZipCode,
  fixMaxLength
} from '@custom/forms';

import { BaseComponent } from '../base.component';

import { STATES, UserModel, AppState, UPDATE_USER_INFO } from '../data-store';

@Component({
  selector: 'address-form',
  template: require('./address-form.view.html')
})
export class AddressFormComponent extends BaseComponent {
  fields: FieldBase<any>[] = [];
  form: FormGroup;
  submitted: boolean = false;
  showGenericError: boolean = false;
  isProcessing: boolean = false;

  @Output() onAddressUpdate: EventEmitter<any> = new EventEmitter();

  constructor( private fieldControlService: FieldControlService,
               private store: Store<AppState>,
               private restService: RestService ) {
    super();

    this.store.select('user')
      .first()
      .subscribe(( user: UserModel ) => {
        this.fields = this.getFormFields(user);
        this.form = this.fieldControlService.toFormGroup(this.fields);
      });
  }

  private getFormFields( user: UserModel ): FieldBase<any>[] {
    return [
      new TextField({
        key: 'address1',
        label: 'Mailing Address',
        value: user.address1,
        required: true,
        minLength: 1,
        maxLength: 30,
        validators: [validateAddress],
        errorMessage: 'Valid mailing address is required.',
        hideLabel: false
      }),
      new TextField({
        key: 'address2',
        label: 'Apt/Floor (optional)',
        value: user.address2 || '',
        maxLength: 30,
        validators: [validateAddress],
        errorMessage: 'Valid apt/floor is required.',
        hideLabel: false
      }),
      new TextField({
        key: 'city',
        label: 'City',
        value: user.city,
        required: false,
        minLength: 1,
        maxLength: 28,
        validators: [validateCity],
        errorMessage: 'Valid city is required.',
        hideLabel: false
      }),
      new DropdownField({
        key: 'state',
        label: 'State',
        options: STATES,
        value: user.state,
        required: true,
        errorMessage: 'Please select your state.',
        hideLabel: false
      }),
      new TextField({
        key: 'zip',
        label: 'Zip Code',
        value: user.zip,
        required: true,
        minLength: 5,
        maxLength: 5,
        validators: [validateZipCode],
        errorMessage: 'Valid 5-digit ZIP is required.',
        hideLabel: false,
        inputHandler: guardNumbersOnly
      })
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }

    this.isProcessing = true;
    this.restService.makeAltriaCall(
      'ADDRESS_UPDATE',
      {
        address1: this.form.controls['address1'].value,
        address2: this.form.controls['address2'].value,
        city: this.form.controls['city'].value,
        state: this.form.controls['state'].value,
        zipcode: this.form.controls['zip'].value
      })
      .subscribe(
        data => {
          this.isProcessing = false;
          this.store.dispatch({ type: UPDATE_USER_INFO, payload: this.form.value });
          this.onAddressUpdate.emit(null);
        },
        err => {
          console.error(err);
          this.isProcessing = false;
          this.showGenericError = true;
        }
      );

  }

  public onCancel( event ): void {
    event.preventDefault();
    this.onAddressUpdate.emit(null);
  }
}


export function guardNumbersOnly( event ): void {
  let arr: Array<string> = event.target.value.split('');
  let finalArr: Array<string> = [];
  let numStr = /[0-9]+$/;
  for (let a in arr) {
    if (numStr.test(arr[a])) {
      finalArr.push(arr[a]);
    }
  }
  event.target.value = finalArr.join('');
  fixMaxLength(event);
}