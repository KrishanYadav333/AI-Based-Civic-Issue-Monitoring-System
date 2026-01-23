import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock async authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock validation
      if (!email || !password) {
        return rejectWithValue('Email and password required');
      }

      const mockUser = {
        id: email === 'admin@example.com' ? '1' : '2',
        email,
        role: email === 'admin@example.com' ? 'admin' : 'engineer',
        name: email === 'admin@example.com' ? 'Admin User' : 'Engineer User',
        wardAssigned: email === 'admin@example.com' ? null : ['Ward 1', 'Ward 2'],
      };

      return mockUser;
    } catch (error) {
      return rejectWithValue(error.message);
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
        state.token = `token-${action.payload.id}`;
        localStorage.setItem('authToken', state.token);
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
