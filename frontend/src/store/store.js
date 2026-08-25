import { configureStore } from '@reduxjs/toolkit';
import snippetReducer from './snippetSlice';
import uiEffectsReducer from './uiEffectsSlice';

export const store = configureStore({
  reducer: {
    snippets: snippetReducer,
    uiEffects: uiEffectsReducer,
  },
});
