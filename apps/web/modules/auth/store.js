import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import authReducer from "./authReducer";
import logger from "redux-logger";
import { reducersForm } from "./authReducer";

const reducers = combineReducers({ auth: authReducer, form: reducersForm });

export const initStore = (initialState = {}) => {
  return createStore(
    reducers,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware, logger))
  );
};
