import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const playerLogsSlicer = createSlice({
  name: "playerLogs",
  initialState,
  reducers: {
    setPlayerLogsState: (state, action) => action.payload,
  },
});

export const { setPlayerLogsState } = playerLogsSlicer.actions;
export default playerLogsSlicer.reducer;
