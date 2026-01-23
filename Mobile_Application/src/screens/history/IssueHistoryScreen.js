import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function IssueHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">My Reports</Text>
      {/* TODO: List of submitted issues with status */}
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
