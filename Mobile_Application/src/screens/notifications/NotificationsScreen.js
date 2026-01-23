import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Notifications</Text>
      {/* TODO: List notifications */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
});
