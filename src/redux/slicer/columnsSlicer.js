import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const symbolSlicer = createSlice({
  name: "columns",
  initialState,
  reducers: {
    setColumnsState: (state, action) => action.payload,
  },
});

export const { setColumnsState } = symbolSlicer.actions;
export default symbolSlicer.reducer;
