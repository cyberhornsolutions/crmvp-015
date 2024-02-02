import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const symbolSlicer = createSlice({
  name: "managers",
  initialState,
  reducers: {
    setManagersState: (state, action) => action.payload,
  },
});

export const { setManagersState } = symbolSlicer.actions;
export default symbolSlicer.reducer;
