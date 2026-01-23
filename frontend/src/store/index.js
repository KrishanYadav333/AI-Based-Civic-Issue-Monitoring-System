import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import issueReducer from './issueSlice';
import userReducer from './analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issueReducer,
    users: userReducer,
  },
});

export default store;
