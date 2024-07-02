import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const commentsSlicer = createSlice({
  name: "comments",
  initialState,
  reducers: {
    setCommentsState: (state, action) => action.payload,
  },
});

export const { setCommentsState } = commentsSlicer.actions;
export default commentsSlicer.reducer;
