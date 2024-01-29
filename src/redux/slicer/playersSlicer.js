import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const PlayersSlicer = createSlice({
  name: "players",
  initialState,
  reducers: {
    setPlayersState: (state, action) => action.payload,
  },
});

export const { setPlayersState } = PlayersSlicer.actions;
export default PlayersSlicer.reducer;
