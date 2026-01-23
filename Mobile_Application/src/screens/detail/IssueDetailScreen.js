import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function IssueDetailScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Issue Details</Text>
      {/* TODO: Show issue photo, location, status, history */}
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
