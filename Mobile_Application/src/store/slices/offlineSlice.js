import { createSlice } from '@reduxjs/toolkit';

const offlineSlice = createSlice({
  name: 'offline',
  initialState: {
    isOnline: true,
    queue: [],
  },
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    addToQueue: (state, action) => {
      state.queue.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter(item => item.id !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
  },
});

export const { setOnlineStatus, addToQueue, removeFromQueue, clearQueue } = offlineSlice.actions;
export default offlineSlice.reducer;
