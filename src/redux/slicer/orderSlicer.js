import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const orderSlicer = createSlice({
  name: "userOrders",
  initialState,
  reducers: {
    setOrdersState: (state, action) => action.payload,
  },
  // extraReducers: {},
});

export const { setOrdersState } = orderSlicer.actions;
export default orderSlicer.reducer;
