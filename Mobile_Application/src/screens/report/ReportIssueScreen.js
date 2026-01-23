import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ReportIssueScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Report Issue</Text>
      {/* TODO: Issue type selection, description, location display, submit */}
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
