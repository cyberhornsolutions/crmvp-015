import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// import { authReducer } from './auth/authReducer';
import { calendarReducer } from "./calendar/calendarReducer";
import symbolsSlicer from "./slicer/symbolsSlicer";
import orderSlicer from "./slicer/orderSlicer";
import userSlicer from "./slicer/userSlice";

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    symbols: symbolsSlicer,
    userOrders: orderSlicer,
    user: userSlicer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export const persistor = persistStore(store);
