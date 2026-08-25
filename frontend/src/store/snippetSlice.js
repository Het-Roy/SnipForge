import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchJson } from '../utils/api';

export const fetchSnippets = createAsyncThunk(
  'snippets/fetchSnippets',
  async ({ mode, search, language, page, token }, { rejectWithValue }) => {
    try {
      const endpoint = mode === 'dashboard' ? '/api/snippets/my' : '/api/snippets';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (language) params.append('language', language);
      params.append('page', page);

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const { response, json } = await fetchJson(`${endpoint}?${params.toString()}`, { headers });

      if (!response.ok || !json.success) throw new Error(json.message || 'Failed to fetch snippets');
      return json.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const snippetSlice = createSlice({
  name: 'snippets',
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalPages: 1,
    totalCount: 0,
    currentPage: 1,
    availableLanguages: []
  },
  reducers: {
    updateBookmark: (state, action) => {
      const { snippetId, userId } = action.payload;
      const snippet = state.items.find(s => s._id === snippetId);
      if (snippet) {
         const index = snippet.bookmarks.indexOf(userId);
         if (index > -1) {
           snippet.bookmarks.splice(index, 1);
         } else {
           snippet.bookmarks.push(userId);
         }
      }
    },
    removeSnippet: (state, action) => {
      state.items = state.items.filter(s => s._id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
    },
    clearSnippets: (state) => {
      state.items = [];
      state.availableLanguages = [];
      state.totalCount = 0;
      state.totalPages = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSnippets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSnippets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.snippets;
        state.totalPages = action.payload.totalPages;
        state.totalCount = action.payload.totalSnippets;
        state.currentPage = action.payload.currentPage;
        state.availableLanguages = action.payload.allLanguages || [];
      })
      .addCase(fetchSnippets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { updateBookmark, removeSnippet, clearSnippets } = snippetSlice.actions;
export default snippetSlice.reducer;
