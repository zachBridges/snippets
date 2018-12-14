import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';

import { RestService } from '@custom/utilities';

import { BaseComponent } from '../base.component';
import { FieldBase, FieldControlService, TextField, FieldOptions, validateEmail } from '@custom/forms';

import { UserModel, AppState, UPDATE_USER_INFO, UPDATE_PROMO_INFO } from '../data-store';
import { HIDE_MODAL } from '@custom/ui-library/bundles';

declare var dcsMultiTrack: any;

@Component({
  selector: 'email-form',
  template: require('./email-form.view.html'),
  providers: [FieldControlService]
})
export class EmailFormComponent extends BaseComponent {
  @Input() buttons: Object;
  @Input() field: Object;
  @Input() isReminder: boolean = false;
  @Input() gameResults: boolean = false;
  @Output() onEmailUpdate: EventEmitter<any> = new EventEmitter();

  emailButtons: Object = {
    submit: {
      label: 'Submit',
      tracking: ''
    },
    cancel: {
      label: 'No Thanks',
      tracking: ''
    }
  };
  emailField: FieldOptions = {
    key: 'email',
    label: 'Email',
    value: '',
    required: true,
    validators: [validateEmail],
    errorMessage: 'Valid email address is required.',
    hideLabel: true,
    maxLength: 120
  };

  currentEmail: string;
  fields: FieldBase<any>[] = [];
  form: FormGroup;
  submitted: boolean = false;
  showGenericError: boolean = false;
  isProcessing: boolean = false;
  checked: boolean = false;
  emailContactable: boolean = false;

  constructor( private fieldControlService: FieldControlService,
               private store: Store<AppState>,
               private restService: RestService ) {
    super();
  }

  private getFormFields( user: UserModel ): FieldBase<any>[] {
    let fieldSet: FieldBase<any>[] = [
      new TextField({
        key: this.emailField.key,
        label: this.emailField.label,
        value: this.currentEmail,
        required: this.emailField.required,
        validators: this.emailField.validators,
        errorMessage: this.emailField.errorMessage,
        hideLabel: this.emailField.hideLabel,
        maxLength: this.emailField.maxLength
      })
    ];
    return fieldSet;
  }

  public onSubmit( event ): void {
    this.showGenericError = false;
    this.submitted = true;

    if (!this.form.valid) {
      this.showGenericError = true;
      return;
    }

    this.isProcessing = true;
    const newEmail: string = this.form.controls['email'].value;

    let payload = { emailAddress: newEmail };

    this.restService.makeAltriaCall(
      'EMAIL_UPDATE', payload)
      .subscribe(
        data => {
          this.isProcessing = false;
          this.store.dispatch(
            {
              type: UPDATE_USER_INFO,
              payload: {
                emailAddress: newEmail,
                emailChangedFromCookie: this.hasNewEmail(newEmail),
                emailSubmitted: true
              }
            }
          );
          this.onEmailUpdate.emit({ emailProvided: true, email: newEmail });
        },
        err => {
          console.error(err);
          this.isProcessing = false;
          this.showGenericError = true;
        }
      );
  }

  private hasNewEmail( newEmail: string ): boolean {
    return this.currentEmail !== newEmail;
  }

  public onCancel( event ): void {
    event.preventDefault();
    this.store.dispatch({ type: HIDE_MODAL });
    if (this.isReminder) {
      this.store.dispatch({
        type: UPDATE_PROMO_INFO,
        payload: {
          whichReminder: ''
        }
      });
    }
  }

  ngOnInit(): void {
    this.emailButtons = {
      submit: {
        label: 'Submit',
        tracking: ''
      },
      cancel: {
        label: 'No Thanks',
        tracking: ''
      }
    };
    this.emailField = {
      key: 'email',
      label: 'Email',
      value: '',
      required: true,
      validators: [validateEmail],
      errorMessage: 'Valid email address is required.',
      hideLabel: true,
      maxLength: 120
    };

    this.emailButtons = Object.assign(this.emailButtons, this.buttons);
    this.emailField = Object.assign(this.emailField, this.field);

    this.store.select('user')
      .first()
      .subscribe(( user: UserModel ) => {
        this.currentEmail = user.email;
        this.emailContactable = (user.emailContactable == '1');
        this.fields = this.getFormFields(user);
        this.form = this.fieldControlService.toFormGroup(this.fields);
      });
  }
}