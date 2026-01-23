import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import issueReducer from './slices/issueSlice';
import offlineReducer from './slices/offlineSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issueReducer,
    offline: offlineReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
