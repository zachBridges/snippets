import { UserModel } from './user.model';
import * as UserActions from './user.action';

export class UserState implements UserModel {}

export function userReducer( state: UserState = new UserState(), action: UserActions.UserActions ) {
  switch (action.type) {
    case UserActions.UPDATE_USER_INFO:
      let newState = action.payload;
      newState.showDOIMessage = showDOI(action.payload, state);
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

function showDOI( update, state ) {
  const emailDOI = (update.hasOwnProperty('emailDOI')) ? update.emailDOI : state.emailDOI;
  const emailUpdateChecked = (update.hasOwnProperty('emailUpdateChecked')) ? update.emailUpdateChecked : state.emailUpdateChecked;
  const emailChangedFromCookie = (update.hasOwnProperty('emailChangedFromCookie')) ? update.emailChangedFromCookie : state.emailChangedFromCookie;

  return ( (emailDOI == '0' && emailUpdateChecked) || (emailDOI == '1' && emailUpdateChecked && emailChangedFromCookie) );
}