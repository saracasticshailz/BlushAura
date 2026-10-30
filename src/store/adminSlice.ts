import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
export const adminSlice = createSlice({
  name: 'admin',
  initialState: { view: 'overview', query: '', orderPage: 0 },
  reducers: {
    viewChanged(state, a: PayloadAction<string>) {
      state.view = a.payload;
      state.query = '';
    },
    queryChanged(state, a: PayloadAction<string>) {
      state.query = a.payload;
    },
    orderPageChanged(state, a: PayloadAction<number>) {
      state.orderPage = Math.max(0, a.payload);
    },
    resetAdminView() {
      return { view: 'overview', query: '', orderPage: 0 };
    },
  },
});
export const adminActions = adminSlice.actions;
