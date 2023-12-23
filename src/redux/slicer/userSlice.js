import { createSlice } from "@reduxjs/toolkit";

const user = localStorage.getItem("USER");
console.log("login = ", user);

const initialState = {
  isLogin: user ? true : false,
  user: user ? JSON.parse(user) : null,
  selectedUser: null,
};

const userSlicer = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLogin = true;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  // extraReducers: {},
});

export const { setUser, setSelectedUser } = userSlicer.actions;
export default userSlicer.reducer;
