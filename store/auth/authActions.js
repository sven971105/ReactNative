import { AsyncStorage } from 'react-native';
import { API_URL } from '../../utils/Config';
import { timeoutPromise } from '../../utils/Tools';

export const SIGN_UP = 'SIGN_UP';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const EDIT_INFO = 'EDIT_INFO ';
export const UPLOAD_PROFILEPIC = 'UPLOAD_PROFILEPIC';
export const FORGET_PASSWORD = 'FORGET_PASSWORD';
export const RESET_PASSWORD = 'RESET_PASSWORD';

import AskingExpoToken from '../../components/Notification/AskingNotiPermission';

//Create dataStorage
const saveDataToStorage = (name, data) => {
  AsyncStorage.setItem(
    name,
    JSON.stringify({
      data,
    })
  );
};

export const SignUp = (name, email, password) => {
  return async (dispatch) => {
    try {
      const response = await timeoutPromise(
        fetch(`${API_URL}/user/register`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        })
      );
      if (!response.ok) {
        const errorResData = await response.json();
        alert(errorResData.err);
      }
      dispatch({
        type: SIGN_UP,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
};

//Login
export const Login = (email, password) => {
  return async (dispatch) => {
    const pushToken = await AskingExpoToken();
    try {
      const response = await timeoutPromise(
        fetch(`${API_URL}/user/login`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            pushTokens: [pushToken],
          }),
        })
      );
      if (!response.ok) {
        const errorResData = await response.json();
        alert(errorResData.err);
      }
      const resData = await response.json();
      saveDataToStorage('user', resData);
      dispatch(setLogoutTimer(60 * 60 * 1000));
      dispatch({
        type: LOGIN,
        user: resData,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
};

export const EditInfo = (phone, address) => {
  return async (dispatch, getState) => {
    const user = getState().auth.user;
    try {
      const response = await timeoutPromise(
        fetch(`${API_URL}/user/${user.userid}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'auth-token': user.token,
          },
          method: 'PATCH',
          body: JSON.stringify({
            phone,
            address,
          }),
        })
      );
      if (!response.ok) {
        const errorResData = await response.json();
        alert(errorResData.err);
      }

      dispatch({
        type: EDIT_INFO,
        phone,
        address,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
};

export const UploadProfilePic = (imageUri, filename, type) => {
  return async (dispatch, getState) => {
    const user = getState().auth.user;
    let formData = new FormData();
    // Infer the type of the image
    await formData.append('profilePic', {
      uri: imageUri,
      name: filename,
      type,
    });
    try {
      const response = await timeoutPromise(
        fetch(`${API_URL}/user/photo/${user.userid}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            'auth-token': user.token,
          },
          method: 'PATCH',
          body: formData,
        })
      );
      if (!response.ok) {
        const errorResData = await response.json();
        alert(errorResData.err);
      }

      dispatch({
        type: UPLOAD_PROFILEPIC,
        profilePic: imageUri,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
};

export const ForgetPassword = (email) => {
  return async (dispatch) => {
    try {
      const response = await timeoutPromise(
        fetch(`${API_URL}/user/reset_pw`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            email,
          }),
        })
      );
      if (!response.ok) {
        const errorResData = await response.json();
        alert(errorResData.err);
      }
      dispatch({
        type: FORGET_PASSWORD,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
};
export const ResetPassword = (password, url) => {
  return async (dispatch) => {
    try {
      const response = await timeoutPromise(
        fetch(
          `${API_URL}/user/receive_new_password/${url.userid}/${url.token}`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              password,
            }),
          }
        )
      );
      if (!response.ok) {
        const errorResData = await response.json();
        alert(errorResData.err);
      }

      dispatch({
        type: RESET_PASSWORD,
      });
    } catch (err) {
      console.log(err.message);
    }
  };
};

//Logout
export const Logout = () => {
  return (dispatch) => {
    clearLogoutTimer(); //clear setTimeout when logout
    AsyncStorage.removeItem('user');
    dispatch({
      type: LOGOUT,
      user: {},
    });
  };
};

//Auto log out
let timer;
const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};
const setLogoutTimer = (expirationTime) => {
  return (dispatch) => {
    timer = setTimeout(async () => {
      await dispatch(Logout());
      alert('Logout section expired');
    }, expirationTime);
  };
};
