import { Routes } from '@angular/router';

import { LifecycleGuard } from './lifecycle.guard';
import { GameGuard } from './game.guard';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { GameComponent, GameResultsComponent } from '../game';

import { ThanksComponent } from '../thanks/thanks.component';
import { AddressWarningComponent } from '../loyalty/address-warning.component';
import { PollTestComponent } from '../poll-test/poll-test.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/enter',
    pathMatch: 'full'
  },
  {
    path: 'enter',
    component: GameComponent,
    canActivate: [GameGuard, LifecycleGuard]
  },
  {
    path: 'results',
    component: GameResultsComponent,
    canActivate: [LifecycleGuard]
  },
  {
    path: 'jic/:errorState',
    component: ErrorStateComponent
  },
  {
    path: 'thanks',
    component: ThanksComponent,
    canActivate: [LifecycleGuard]
  },
  {
    path: 'address-warning',
    component: AddressWarningComponent,
    canActivate: [LifecycleGuard]
  },
  {
    path: 'testing-poll',
    component: PollTestComponent
  }
];