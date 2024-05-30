import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const ipSlicer = createSlice({
  name: "ips",
  initialState,
  reducers: {
    setIpsState: (state, action) => action.payload,
  },
});

export const { setIpsState } = ipSlicer.actions;
export default ipSlicer.reducer;
