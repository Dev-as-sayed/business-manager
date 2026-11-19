import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = (): { isConnected: boolean; isInternetReachable: boolean } => {
  const [state, setState] = useState({ isConnected: true, isInternetReachable: true });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((next) => {
      setState({
        isConnected: next.isConnected ?? true,
        isInternetReachable: next.isInternetReachable ?? true,
      });
    });

    void NetInfo.fetch().then((next) => {
      setState({
        isConnected: next.isConnected ?? true,
        isInternetReachable: next.isInternetReachable ?? true,
      });
    });

    return unsubscribe;
  }, []);

  return state;
};
