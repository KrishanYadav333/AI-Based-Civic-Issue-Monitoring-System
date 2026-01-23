import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import IssueService from '../../services/IssueService';

export const submitIssue = createAsyncThunk(
  'issues/submit',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await IssueService.submitIssue(issueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyIssues = createAsyncThunk(
  'issues/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await IssueService.getMyIssues();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchById',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await IssueService.getIssueById(issueId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const issueSlice = createSlice({
  name: 'issues',
  initialState: {
    myIssues: [],
    selectedIssue: null,
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedIssue: (state) => {
      state.selectedIssue = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitIssue.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitIssue.fulfilled, (state, action) => {
        state.submitting = false;
        state.myIssues.unshift(action.payload);
      })
      .addCase(submitIssue.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(fetchMyIssues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.myIssues = action.payload;
      })
      .addCase(fetchMyIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIssueById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIssueById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIssue = action.payload;
      })
      .addCase(fetchIssueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedIssue } = issueSlice.actions;
export default issueSlice.reducer;
