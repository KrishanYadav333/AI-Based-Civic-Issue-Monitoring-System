import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  current: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    synced: 0,
    pending: 0,
    queueSize: 0,
  },
};

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setIssues: (state, action) => {
      state.list = action.payload;
    },
    addIssue: (state, action) => {
      state.list.unshift(action.payload);
    },
    updateIssue: (state, action) => {
      const index = state.list.findIndex(i => i.localId === action.payload.localId);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      }
    },
    setCurrentIssue: (state, action) => {
      state.current = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setIssues,
  addIssue,
  updateIssue,
  setCurrentIssue,
  setStats,
  setLoading,
  setError,
} = issueSlice.actions;

export default issueSlice.reducer;
