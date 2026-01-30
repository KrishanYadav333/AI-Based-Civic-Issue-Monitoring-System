import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { issueService } from '../services/api';

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await issueService.getIssues(filters);
      return response.data || response.issues || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await issueService.updateIssue(id, data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await issueService.createIssue(issueData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const resolveIssue = createAsyncThunk(
  'issues/resolveIssue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await issueService.resolveIssue(id, data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  issues: [],
  selectedIssue: null,
  loading: false,
  error: null,
  filters: {
    priority: [],
    type: [],
    status: [],
    ward: [],
  },
  searchQuery: '',
  sortBy: 'date',
  pagination: {
    page: 1,
    pageSize: 10,
  },
};

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setSelectedIssue: (state, action) => {
      state.selectedIssue = action.payload;
    },
    clearSelectedIssue: (state) => {
      state.selectedIssue = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    addComment: (state, action) => {
      if (state.selectedIssue) {
        state.selectedIssue.comments = state.selectedIssue.comments || [];
        state.selectedIssue.comments.push(action.payload);
      }
    },
    addResolutionImage: (state, action) => {
      if (state.selectedIssue) {
        state.selectedIssue.resolutionImages = state.selectedIssue.resolutionImages || [];
        state.selectedIssue.resolutionImages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        // Handle nested data structure from API: {data: {data: [], pagination: {}}}
        const payload = action.payload;
        if (payload.data && Array.isArray(payload.data)) {
          state.issues = payload.data;
          state.pagination = payload.pagination || state.pagination;
        } else if (Array.isArray(payload)) {
          state.issues = payload;
        } else {
          state.issues = [];
        }
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIssue.fulfilled, (state, action) => {
        const index = state.issues.findIndex(issue => issue.id === action.payload.id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
        if (state.selectedIssue?.id === action.payload.id) {
          state.selectedIssue = action.payload;
        }
      });
  },
});

export const {
  setSelectedIssue,
  clearSelectedIssue,
  setFilters,
  setSearchQuery,
  setSortBy,
  setPagination,
  addComment,
  addResolutionImage,
} = issueSlice.actions;

export default issueSlice.reducer;
