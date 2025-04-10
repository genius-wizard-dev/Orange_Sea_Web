import { combineReducers } from "@reduxjs/toolkit";
// import authReducer from "./auth";
import profileReducer from "./profile";
const rootReducer = combineReducers({
  // auth: authReducer,
  profile: profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
// export { authReducer, profileReducer };
export default rootReducer;
