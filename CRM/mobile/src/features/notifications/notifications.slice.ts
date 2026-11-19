import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationsState {
  lastReadAt: string | null;
}

const initialState: NotificationsState = { lastReadAt: null };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAllRead(state) {
      state.lastReadAt = new Date().toISOString();
    },
    setLastReadAt(state, action: PayloadAction<string | null>) {
      state.lastReadAt = action.payload;
    },
  },
});

export const { markAllRead, setLastReadAt } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;

interface NotificationsRootState {
  notifications: NotificationsState;
}

export const selectLastReadAt = (state: NotificationsRootState) => state.notifications.lastReadAt;
