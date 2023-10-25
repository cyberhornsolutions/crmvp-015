import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const createEvent = (data) => {
  return {
    id: "",
    title: "",
    started_at: "",
    finished_at: "",
    date: null,
    ...data,
  };
};

const EVENT = createEvent({});

const EVENTS_MOCKS = [EVENT];

const calendarSlice = createSlice({
  name: "calendar",
  initialState: {
    events: EVENTS_MOCKS,
    currentEvents: [],
  },
  reducers: {
    addEvent: (state, { payload }) => {
      state.events.push(createEvent(payload));
    },

    deleteEvent: (state, { payload }) => {
      state.events = state.events.filter((event) => payload.id !== event.id);

      state.currentEvents = state.events;
    },

    filterEvents: (state, { payload }) => {
      const { startDateQuery, endDateQuery } = payload;
      const copyEvents = [...state.events];

      const filteredEvents = copyEvents.filter((event) => {
        return event.date >= startDateQuery && event.date <= endDateQuery;
      });
      state.currentEvents = [...filteredEvents];
    },
  },
});

const persistConfig = {
  key: "root",
  storage,
};

export const { addEvent, filterEvents, deleteEvent } = calendarSlice.actions;
export const calendarReducer = persistReducer(
  persistConfig,
  calendarSlice.reducer
);
