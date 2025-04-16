import { combineReducers } from "@reduxjs/toolkit";
// import authReducer from "./auth";
import friendReducer from "./friend";
import profileReducer from "./profile";
import userModalReducer from "./userModal";
const rootReducer = combineReducers({
  // auth: authReducer,
  profile: profileReducer,
  userModal: userModalReducer,
  friend: friendReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
// export { authReducer, profileReducer };
export default rootReducer;
