import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const statusesSlicer = createSlice({
  name: "statuses",
  initialState,
  reducers: {
    setStatusesState: (state, action) => action.payload,
  },
});

export const { setStatusesState } = statusesSlicer.actions;
export default statusesSlicer.reducer;
