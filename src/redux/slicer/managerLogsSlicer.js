import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const managerLogsSlicer = createSlice({
  name: "managerLogs",
  initialState,
  reducers: {
    setManagerLogsState: (state, action) => action.payload,
  },
});

export const { setManagerLogsState } = managerLogsSlicer.actions;
export default managerLogsSlicer.reducer;
