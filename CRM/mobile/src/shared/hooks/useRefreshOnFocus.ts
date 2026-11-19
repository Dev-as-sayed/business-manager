import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

export const useRefreshOnFocus = (refresh: () => void, enabled = true): void => {
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }

      if (enabled) {
        refresh();
      }
    }, [enabled, refresh]),
  );
};
