import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockIssues } from '../data/mockData';

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockIssues;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return issueData;
    } catch (error) {
      return rejectWithValue(error.message);
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
        state.issues = action.payload;
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
