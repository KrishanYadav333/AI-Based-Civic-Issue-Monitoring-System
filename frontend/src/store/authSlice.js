import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/api';

// Real authentication with backend
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);
      const userData = response.data || response;
      
      // Store token
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userRole', userData.user?.role || userData.role);
      }
      
      return userData.user || userData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid credentials');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: localStorage.getItem('authToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
    },
    restoreAuth: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.isAuthenticated = !!user;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.token = localStorage.getItem('authToken'); // Use the actual JWT token stored during login
        localStorage.setItem('userRole', action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
