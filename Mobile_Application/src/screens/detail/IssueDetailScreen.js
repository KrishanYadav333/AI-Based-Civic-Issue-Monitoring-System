import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

export default function IssueDetailScreen({ route, navigation }) {
  const { issue } = route.params;

  const getStatusColor = (status) => {
    const colors = { pending: '#FF9800', 'in-progress': '#2196F3', resolved: '#4CAF50', rejected: '#F44336' };
    return colors[status] || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      {issue.imageUri && <Image source={{ uri: issue.imageUri }} style={styles.image} />}
      
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall">{issue.issueType}</Text>
            <Chip style={{ backgroundColor: getStatusColor(issue.status) }} textStyle={{ color: '#fff' }}>
              {issue.synced ? issue.status : 'Local'}
            </Chip>
          </View>
          
          {issue.description && <Text style={styles.description}>{issue.description}</Text>}
          
          <View style={styles.info}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.infoText}>{new Date(issue.createdAt).toLocaleString()}</Text>
          </View>
          
          <View style={styles.info}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.infoText}>{issue.address || `${issue.latitude}, ${issue.longitude}`}</Text>
          </View>
          
          {issue.detectedType && (
            <View style={styles.aiInfo}>
              <Ionicons name="sparkles" size={16} color="#9C27B0" />
              <Text>AI Detected: {issue.detectedType} ({(issue.confidence * 100).toFixed(0)}%)</Text>
            </View>
          )}
          
          {issue.priority && (
            <View style={styles.info}>
              <Ionicons name="alert-circle" size={16} color="#F44336" />
              <Text>Priority: {issue.priority}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Location" />
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: issue.latitude,
              longitude: issue.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: issue.latitude, longitude: issue.longitude }} />
          </MapView>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  image: { width: '100%', height: 300 },
  card: { margin: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  description: { marginBottom: 15, color: '#666' },
  info: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  infoText: { marginLeft: 8, flex: 1 },
  aiInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', padding: 10, borderRadius: 8, marginTop: 10 },
  mapContainer: { height: 200 },
  map: { flex: 1 },
});
