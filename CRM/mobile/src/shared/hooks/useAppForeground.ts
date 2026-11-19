import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const useAppForeground = (onForeground: () => void): void => {
  const current = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (current.current?.match(/inactive|background/) && next === 'active') {
        onForeground();
      }

      current.current = next;
    });

    return () => subscription.remove();
  }, [onForeground]);
};
