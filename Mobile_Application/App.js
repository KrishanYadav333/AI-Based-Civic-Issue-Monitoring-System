import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';
import databaseService from './src/services/DatabaseService';
import syncService from './src/services/SyncService';
import NetworkMonitor from './src/components/NetworkMonitor';

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await databaseService.initialize();
        
        // Initialize notification service
        await NotificationService.initialize();
        
        // Start auto-sync
        syncService.startAutoSync(5); // Sync every 5 minutes
        
        setIsReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsReady(true); // Continue anyway
      }
    }

    initialize();

    return () => {
      syncService.stopAutoSync();
    };
  }, []);

  if (!isReady) {
    return null; // Or a splash screen
  }

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
