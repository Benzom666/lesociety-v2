import { call, put, race, take, takeLatest } from "redux-saga/effects";
import { apiRequest, showToast } from "../../utils/Utilities";
import { AUTHENTICATE, AUTHENTICATE_UPDATE } from "./actionConstants";
import { stopSubmit, reset } from "redux-form";
import Router, { useRouter } from "next/router";
import { SIGNUP1, SIGNUP2, SIGNUP3, LOGIN, SIGNUP4 } from "./actionConstants";
import { useDispatch } from "react-redux";
import { logout } from "./authActions";

export function* login(action) {
  action.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: action.payload,
        method: "POST",
        url: `user/login`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });
    if (response.success) {
      yield put({
        type: AUTHENTICATE,
        payload: response.success.data.data,
      });
      //  showToast(response.success.data.message, 'success')
      action.loader(false);

      if (
        response.success.data.data.step_completed === 1 ||
        response.success.data.data.step_completed === 2 ||
        response.success.data.data.step_completed === 3
      ) {
        Router.push({
          pathname: "/auth/profile",
        });
      } else {
        if (
          response.success?.data?.data?.status === 2 &&
          response.success?.data?.data?.verified_screen_shown === false
        ) {
          Router.push({
            pathname: "/user/verified",
          });
        } else if (
          response.success?.data?.data?.status === 2 &&
          response.success?.data?.data?.verified_screen_shown === true
        ) {
          Router.push({
            pathname: "/user/user-list",
          });
        } else if (response.success.data.data.status === 3) {
          Router.push({
            pathname: "/auth/block",
          });
        } else if (response.success.data.data.request_change_fired) {
          Router.push({
            pathname: "/auth/verify-profile",
          });
        }
        // else if (!response.success.data.data.tag_desc_verified) {
        //   Router.push({
        //     pathname: "/auth/verify-profile-done",
        //   });
        // }
        else {
          Router.push({
            pathname: "/auth/profile",
          });
        }
      }
      yield put(reset("LoginForm"));
    }
  } catch (error) {
    action.loader(false);
    if (error.response?.status === 401) {
      yield put(
        stopSubmit("LoginForm", {
          [error.response &&
          (error.response?.data?.message ===
            "Given user name is not registered" ||
            error.response?.data?.message ===
              "Given user email is not registered")
            ? "email"
            : "password"]: error?.response
            ? error.response.data.message
            : error.message,
        })
      );
    } else {
      showToast("Something went wrong", "error");
    }
  }
}

function* signup(data) {
  data.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      yield put({
        type: AUTHENTICATE,
        payload: response.success.data.data,
      });
      data.loader(false);
      Router.push({
        pathname: "/auth/profile",
      });
      if (data.payload?.gender === "male") {
        yield put(reset("RegisterFormMale"));
      } else {
        yield put(reset("RegisterForm"));
      }
      yield put(reset("signupStep2"));
    }
  } catch (error) {
    data.loader(false);
    yield put(
      stopSubmit(
        data.payload?.gender === "male" ? "RegisterFormMale" : "RegisterForm",
        error?.response ? error.response.data.data : {}
      )
    );
    // showToast("Something went wrong", 'error')
  }
}

function* signupStep2(data) {
  data.loader(true);
  try {
    console.log("console from here ", data.payload);
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup/step2`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      yield put({
        type: AUTHENTICATE_UPDATE,
        payload: {
          description: data?.payload?.description,
          tagline: data?.payload?.tagline,
          images: data?.payload?.images,
          step_completed: 2,
          un_verified_images: data?.payload?.un_verified_images,
          un_verified_tagline: data?.payload?.un_verified_tagline,
          un_verified_description: data?.payload?.un_verified_description,
        },
      });
      // showToast(response.success.data.message, 'success')
      //yield put(reset('signupStep2'))
      data.loader(false);
      window.scrollTo(0, 0);
    }
  } catch (error) {
    data.loader(false);
    yield put(
      stopSubmit("signupStep2", error?.response ? error.response.data.data : {})
    );
    showToast(
      error?.response ? error.response.data.message : error.message,
      "error"
    );
    const router = useRouter();
    const dispatch = useDispatch();

    if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Failed to authenticate token!"
    ) {
      setTimeout(() => {
        logout(router, dispatch);
      }, 100);
    }
    return error;
  }
}

function* signupStep3(data) {
  data.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup/step3`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      yield put({
        type: AUTHENTICATE_UPDATE,
        payload: {
          height: data.payload?.height,
          is_smoker: data.payload?.is_smoker,
          occupation: data.payload?.occupation,
          max_education: data.payload?.max_education,
          step_completed: 3,
        },
      });
      data?.loader(false);
      window.scrollTo(0, 0);
      // showToast(response.success.data.message, 'success')
      yield put(reset("signupStep3"));
      yield put(reset("signupStep2"));
    }
  } catch (error) {
    yield put(
      stopSubmit("signupStep3", error?.response ? error.response.data.data : {})
    );
    showToast(
      error?.response ? error.response.data.message : error.message,
      "error"
    );
    data.loader(false);

    const router = useRouter();
    const dispatch = useDispatch();

    if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Failed to authenticate token!"
    ) {
      setTimeout(() => {
        logout(router, dispatch);
      }, 100);
    }
    return error;
  }
}

function* signupStep4(data) {
  // debugger
  data.loader(true);
  try {
    const response = yield race({
      success: call(apiRequest, {
        data: data.payload,
        method: "POST",
        url: `user/signup/step4`,
      }),
      cancel: take("ROUTE/CHANGE"),
    });

    if (response.success) {
      // data?.handleUpdateRoutePage && data.handleUpdateRoutePage();
      yield put({
        type: AUTHENTICATE_UPDATE,
        payload: { step_completed: 4 },
      });
      data.loader(false);
      window.scrollTo(0, 0);
      // showToast(response.success.data.message, 'success')
    }
  } catch (error) {
    showToast(
      error?.response ? error.response.data.message : error.message,
      "error"
    );
    data.loader(false);
    const router = useRouter();
    const dispatch = useDispatch();

    if (
      error?.response?.status === 401 &&
      error?.response?.data?.message === "Failed to authenticate token!"
    ) {
      setTimeout(() => {
        logout(router, dispatch);
      }, 100);
    }
    return error;
  }
}

export default function* authWatcher() {
  yield takeLatest(SIGNUP1, signup);
  yield takeLatest(SIGNUP2, signupStep2);
  yield takeLatest(SIGNUP3, signupStep3);
  yield takeLatest(SIGNUP4, signupStep4);
  yield takeLatest(LOGIN, login);
}
