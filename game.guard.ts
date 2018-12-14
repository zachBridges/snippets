import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { AppState, UserModel } from '../data-store';

@Injectable()
export class GameGuard implements CanActivate {

  isAllowed: boolean = false;

  constructor( private store: Store<AppState>, private router: Router ) {
    this.store.select('user')
      .subscribe(
        ( data: UserModel ) => this.isAllowed = !data.is_limited
      )
  }

  canActivate() {
    if (!this.isAllowed) {
      this.router.navigateByUrl('/explore')
        .catch(() => {
          console.error("not able to reach route");
        });
    }
    return this.isAllowed;
  }
}