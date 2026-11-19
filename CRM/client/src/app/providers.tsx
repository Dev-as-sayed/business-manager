import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/app/store';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    {children}
    <Toaster
      position="top-right"
      closeButton
      richColors
      theme="system"
      toastOptions={{ duration: 4000 }}
    />
  </Provider>
);
