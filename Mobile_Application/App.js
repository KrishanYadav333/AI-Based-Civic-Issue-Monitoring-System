import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';
import NetworkMonitor from './src/components/NetworkMonitor';

export default function App() {
  React.useEffect(() => {
    // Initialize notification service
    NotificationService.initialize();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <NetworkMonitor />
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
