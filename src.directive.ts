import { Directive, ElementRef, Renderer, OnInit, OnChanges } from '@angular/core';
import { Observable, Observer } from 'rxjs/Rx';

import { Constants, Images } from '../data-store';

@Directive({
  selector: '[localSrc],[cmsSrc]',
  inputs: ['localSrc', 'cmsSrc']
})
export class localImageSrcDirective implements OnInit, OnChanges {
  localSrc: string;
  cmsSrc: string;

  constructor( private _elRef: ElementRef, private _render: Renderer ) {
  }

  ngOnInit() {
    this._render.setElementAttribute(this._elRef.nativeElement, 'src', getChannelSrc(this.localSrc, this.cmsSrc));
  }

  ngOnChanges() {
    this._render.setElementAttribute(this._elRef.nativeElement, 'src', getChannelSrc(this.localSrc, this.cmsSrc));
  }
}

@Directive({
  selector: '[localSrcBg],[cmsSrcBg]',
  inputs: ['localSrcBg', 'cmsSrcBg']
})

OnInit, OnChanges {
  public localSrcBg: string;
  public cmsSrcBg: string;

  constructor( private _elRef: ElementRef, private _render: Renderer ) {
  }

  public ngOnInit(): void {
    this.setBackground();
  }

  public ngOnChanges(): void {
    this.setBackground();
  }

  private setBackground(): void {
    if (!this.localSrcBg && !this.cmsSrcBg) {
      return;
    }
    this._render.setElementStyle(
      this._elRef.nativeElement,
      'background-image',
      `url(${getChannelSrc(this.localSrcBg, this.cmsSrcBg)})`
    );
  }
}

export function getChannelSrc( localSrc: string = '', cmsSrc: string = '', images: any = Images ): string {

  if (localSrc === null || cmsSrc === null) {
    return;
  }

  const path: string = (localSrc !== '') ? `${Constants.APP_PATH}images/` : '';
  const imagePath: string = (localSrc !== '') ? localSrc : cmsSrc;
  let returnFileName: string;

  returnFileName = (localSrc !== '') ? images[imagePath] : imagePath;
  return path + returnFileName;

}

export function preloadImage( src: string ): Observable<any> {
  return Observable.create(( observer: Observer<any> ) => {
    let img = document.createElement('img');
    img.onload = () => {
      observer.next(img);
    };
    img.src = src;
  })
}