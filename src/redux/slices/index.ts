import { combineReducers } from "@reduxjs/toolkit";
// import authReducer from "./auth";
import friendReducer from "./friend";
import profileReducer from "./profile";
import userModalReducer from "./userModal";
import groupReducer from "./group";
import chatReducer from "./chat";
const rootReducer = combineReducers({
  // auth: authReducer,
  profile: profileReducer,
  userModal: userModalReducer,
  friend: friendReducer,
  group: groupReducer,
  chat: chatReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
// export { authReducer, profileReducer };
export default rootReducer;
