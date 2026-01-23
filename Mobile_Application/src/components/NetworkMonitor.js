import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Banner } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Network from 'expo-network';
import { setOnlineStatus } from '../store/slices/offlineSlice';

export default function NetworkMonitor() {
  const dispatch = useDispatch();
  const { isOnline } = useSelector((state) => state.offline);

  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const networkState = await Network.getNetworkStateAsync();
    dispatch(setOnlineStatus(networkState.isConnected));
  };

  return (
    <Banner
      visible={!isOnline}
      actions={[]}
      icon="wifi-off"
      style={styles.banner}
    >
      You are offline. Issues will be synced when connection is restored.
    </Banner>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFA726',
  },
});
