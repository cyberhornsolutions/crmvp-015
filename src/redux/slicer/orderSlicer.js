import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
};

const orderSlicer = createSlice({
  name: "userOrders",
  initialState,
  reducers: {
    setUserOrders: (state, action) => {
      state.orders = action.payload;
    },
  },
  // extraReducers: {},
});

export const { setUserOrders } = orderSlicer.actions;
export default orderSlicer.reducer;
