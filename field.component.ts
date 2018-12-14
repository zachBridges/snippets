import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldBase } from './fields/field-base';

declare var dcsMultiTrack: any;

@Component({
  selector: 'hw-field',
  template: require('./field.view.html'),
  styles: [require('./field.component.css')]
})
export class FieldComponent {
  @Input() field: FieldBase<any>;
  @Input() form: FormGroup;
  @Input() formSubmitted: boolean;

  @ViewChild('errorModal') errorModal: ElementRef;

  constructor() {
  }

  get isValid() {
    return this.form.controls[this.field.key].valid;
  }

  private shouldShowErrors(): boolean {
    return !!this.form.controls[this.field.key].errors
      && !!this.field.errorMessage
      && !!this.formSubmitted;
  }

  public onFocus(): void {
    if (!this.shouldShowErrors()) {
      return;
    }
    this.errorModal.nativeElement.classList.add('active');
  }

  public onBlur(): void {
    this.errorModal.nativeElement.classList.remove('active');
  }

  public onChange( field, value ) {
    field.value = value;
  }

  public onCheckboxClick() {
    if (this.field.hwTrack) {
      dcsMultiTrack('DCS.dcsuri', this.field.hwTrack);
    }
  }

}
