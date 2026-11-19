import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { createTransform, persistReducer, persistStore } from 'redux-persist';
import { baseApi } from '@/api/baseApi';
import { authReducer } from '@/features/auth/auth.slice';
import { uploadQueueReducer } from '@/features/attachments/uploadQueue.slice';
import { notificationsReducer } from '@/features/notifications/notifications.slice';
import { cacheStorage } from '@/shared/storage/cacheStorage';

const rootReducer = combineReducers({
  auth: authReducer,
  uploadQueue: uploadQueueReducer,
  notifications: notificationsReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const uploadQueueTransform = createTransform(
  (inbound: { items: { status: string; progress: number }[] }) => ({
    items: inbound.items.map((item) =>
      item.status === 'uploading' ? { ...item, status: 'queued', progress: 0 } : item,
    ),
  }),
  (outbound) => outbound,
  { whitelist: ['uploadQueue'] },
);

const persistConfig = {
  key: 'omnia-cache',
  version: 2,
  storage: cacheStorage,
  whitelist: [baseApi.reducerPath, 'notifications', 'uploadQueue'],
  transforms: [uploadQueueTransform],
};

type RootReducerState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer<RootReducerState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH'],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch, (dispatch, actions) => {
  const appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      dispatch(actions.onFocus());
    } else {
      dispatch(actions.onFocusLost());
    }
  });

  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      dispatch(actions.onOnline());
    } else {
      dispatch(actions.onOffline());
    }
  });

  return () => {
    appStateSubscription.remove();
    unsubscribeNetInfo();
  };
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
