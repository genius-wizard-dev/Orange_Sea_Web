import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth";

const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export { authReducer };
export default rootReducer;
