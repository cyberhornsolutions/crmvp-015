import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const symbolSlicer = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setTeamsState: (state, action) => action.payload,
  },
});

export const { setTeamsState } = symbolSlicer.actions;
export default symbolSlicer.reducer;
