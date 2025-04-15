import { combineReducers } from "@reduxjs/toolkit";
// import authReducer from "./auth";
import profileReducer from "./profile";
import userModalReducer from "./userModal";
const rootReducer = combineReducers({
  // auth: authReducer,
  profile: profileReducer,
  userModal: userModalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
// export { authReducer, profileReducer };
export default rootReducer;
