import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import issueReducer from './issueSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issueReducer,
  },
});
