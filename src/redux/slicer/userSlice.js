import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
};

const userSlicer = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  // extraReducers: {},
});

export const { setUser } = userSlicer.actions;
export default userSlicer.reducer;
