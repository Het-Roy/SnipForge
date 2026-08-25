import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  x: 0,
  y: 0,
  activeX: 0,
  activeY: 0,
  isInside: false,
  isPressed: false,
  isHoveringInteractive: false,
};

const uiEffectsSlice = createSlice({
  name: 'uiEffects',
  initialState,
  reducers: {
    setPointerPosition(state, action) {
      state.x = action.payload.x;
      state.y = action.payload.y;
      state.activeX = action.payload.x;
      state.activeY = action.payload.y;
    },
    setPointerInside(state, action) {
      state.isInside = action.payload;
    },
    setPointerPressed(state, action) {
      state.isPressed = action.payload;
    },
    setHoveringInteractive(state, action) {
      state.isHoveringInteractive = action.payload;
    },
  },
});

export const {
  setPointerPosition,
  setPointerInside,
  setPointerPressed,
  setHoveringInteractive,
} = uiEffectsSlice.actions;

export default uiEffectsSlice.reducer;
