import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  preferredTimeWindows: [],
  friendGroups: [],
  privacySettings: {
    defaultExpiration: '24h',
    autoPrivateMode: true,
    dataRetentionDays: 30
  },
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setPreferredTimeWindows: (state, action) => {
      state.preferredTimeWindows = action.payload;
    },
    setFriendGroups: (state, action) => {
      state.friendGroups = action.payload;
    },
    addFriendGroup: (state, action) => {
      state.friendGroups.push(action.payload);
    },
    updatePrivacySettings: (state, action) => {
      state.privacySettings = {
        ...state.privacySettings,
        ...action.payload
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      return initialState;
    }
  }
});

export const {
  setUser,
  setPreferredTimeWindows,
  setFriendGroups,
  addFriendGroup,
  updatePrivacySettings,
  setLoading,
  setError,
  clearError,
  logout
} = userSlice.actions;

export default userSlice.reducer;
