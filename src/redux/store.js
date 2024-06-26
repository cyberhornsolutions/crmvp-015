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
import transactionSlicer from "./slicer/transactionSlicer";
import playersSlicer from "./slicer/playersSlicer";
import managersSlice from "./slicer/managersSlice";
import teamsSlice from "./slicer/teamsSlice";
import columnsSlicer from "./slicer/columnsSlicer";
import ipsSlicer from "./slicer/ipsSlicer";

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    symbols: symbolsSlicer,
    orders: orderSlicer,
    user: userSlicer,
    deposits: transactionSlicer,
    players: playersSlicer,
    managers: managersSlice,
    teams: teamsSlice,
    columns: columnsSlicer,
    ips: ipsSlicer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

export const persistor = persistStore(store);
