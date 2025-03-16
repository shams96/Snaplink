import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snaps: [],
  recentSnaps: [],
  dailyChallenge: null,
  loading: false,
  error: null
};

const snapsSlice = createSlice({
  name: 'snaps',
  initialState,
  reducers: {
    setSnaps: (state, action) => {
      state.snaps = action.payload;
    },
    addSnap: (state, action) => {
      state.snaps.unshift(action.payload);
    },
    removeSnap: (state, action) => {
      state.snaps = state.snaps.filter(snap => snap.id !== action.payload);
    },
    setRecentSnaps: (state, action) => {
      state.recentSnaps = action.payload;
    },
    setDailyChallenge: (state, action) => {
      state.dailyChallenge = action.payload;
    },
    addReaction: (state, action) => {
      const { snapId, reaction } = action.payload;
      const snapIndex = state.snaps.findIndex(snap => snap.id === snapId);
      
      if (snapIndex !== -1) {
        if (!state.snaps[snapIndex].reactions) {
          state.snaps[snapIndex].reactions = [];
        }
        state.snaps[snapIndex].reactions.push(reaction);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setSnaps,
  addSnap,
  removeSnap,
  setRecentSnaps,
  setDailyChallenge,
  addReaction,
  setLoading,
  setError,
  clearError
} = snapsSlice.actions;

export default snapsSlice.reducer;
