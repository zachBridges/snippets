import * as fromUser from './user.reducer'
import * as UserActions from './user.action';

describe('#userReducer', () => {
  const newUser = {
    first_name: 'Firstname',
    last_name: 'Lastname'
  }

  it('should add user data when UPDATE_USER_INFO is called on app startup', () => {
    let userState = fromUser.userReducer({}, new UserActions.UpdateUserInfo(newUser));
    expect(userState).toEqual(jasmine.objectContaining(newUser));
  });

  it('should update only user keys that are passed in with the UPDATE_USER_INFO action', () => {
    let userState = fromUser.userReducer(newUser, new UserActions.UpdateUserInfo({'last_name': 'Updated-Lastname'}));
    expect(userState).toEqual(jasmine.objectContaining({ first_name: newUser.first_name, last_name: 'Updated-Lastname' }));
  });

  it('should add the showDOIMessage flag to the user data', () => {
    let userState = fromUser.userReducer({}, new UserActions.UpdateUserInfo(newUser));
    expect(userState.hasOwnProperty('showDOIMessage')).toBeTruthy();
  });

  it('should set the showDOIMessage flag to true if the emailDOI is 0 and the user submit their email', () => {
    let userState = fromUser.userReducer({ emailDOI: '0' }, new UserActions.UpdateUserInfo({ emailUpdateChecked: true }));
    expect(userState.showDOIMessage).toBeTruthy();
  });

  it('should set the showDOIMessage flag to true if the emailDOI is 1, but the user updated their email and submitted it', () => {
    let userState = fromUser.userReducer({ emailDOI: '1' }, new UserActions.UpdateUserInfo({ emailUpdateChecked: true, emailChangedFromCookie: true }));
    expect(userState.showDOIMessage).toBeTruthy();
  });

})