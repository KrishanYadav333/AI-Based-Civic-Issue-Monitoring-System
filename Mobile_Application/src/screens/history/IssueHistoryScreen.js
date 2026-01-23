import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { Text, Card, Chip, Searchbar, FAB, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import databaseService from '../../services/DatabaseService';

export default function IssueHistoryScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [searchQuery, filter, issues]);

  const loadIssues = async () => {
    try {
      const data = await databaseService.getAllIssues();
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  };

  const filterIssues = () => {
    let filtered = [...issues];
    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (issue.address && issue.address.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (filter !== 'all') {
      if (filter === 'synced') {
        filtered = filtered.filter(issue => issue.synced === 1);
      } else if (filter === 'pending') {
        filtered = filtered.filter(issue => issue.synced === 0);
      }
    }
    setFilteredIssues(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      'in-progress': '#2196F3',
      resolved: '#4CAF50',
      rejected: '#F44336',
    };
    return colors[status] || '#999';
  };

  const renderIssueItem = ({ item }) => (
    <Card 
      style={styles.issueCard}
      onPress={() => navigation.navigate('IssueDetail', { issue: item })}
    >
      <View style={styles.cardContent}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        )}
        <View style={styles.issueInfo}>
          <View style={styles.issueHeader}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.issueType}>
              {item.issueType}
            </Text>
            <View style={styles.badges}>
              {!item.synced && (
                <Chip compact style={styles.localChip} textStyle={styles.localChipText}>
                  Local
                </Chip>
              )}
              {item.synced && item.status && (
                <Chip 
                  compact 
                  style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                  textStyle={styles.statusChipText}
                >
                  {item.status}
                </Chip>
              )}
            </View>
          </View>
          {item.description && (
            <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
              {item.description}
            </Text>
          )}
          <View style={styles.metadata}>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.metaText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text variant="bodySmall" style={styles.metaText} numberOfLines={1}>
                {item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
              </Text>
            </View>
          </View>
          {item.detectedType && (
            <View style={styles.aiDetection}>
              <Ionicons name="sparkles" size={14} color="#9C27B0" />
              <Text variant="bodySmall" style={styles.aiText}>
                AI: {item.detectedType} ({(item.confidence * 100).toFixed(0)}%)
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No issues found</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search issues..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: 'all', label: `All (${issues.length})` },
          { value: 'synced', label: `Synced (${issues.filter(i => i.synced).length})` },
          { value: 'pending', label: `Pending (${issues.filter(i => !i.synced).length})` },
        ]}
        style={styles.filterTabs}
      />
      <FlatList
        data={filteredIssues}
        renderItem={renderIssueItem}
        keyExtractor={(item) => item.localId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('Camera')} label="New Issue" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { margin: 10, elevation: 2 },
  filterTabs: { marginHorizontal: 10, marginBottom: 10 },
  listContent: { padding: 10 },
  issueCard: { marginBottom: 12, elevation: 2 },
  cardContent: { flexDirection: 'row', padding: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  issueInfo: { flex: 1 },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  issueType: { flex: 1, fontWeight: 'bold' },
  badges: { flexDirection: 'row', gap: 4 },
  localChip: { backgroundColor: '#FF9800', height: 24 },
  localChipText: { color: '#fff', fontSize: 10 },
  statusChip: { height: 24 },
  statusChipText: { color: '#fff', fontSize: 10 },
  description: { color: '#666', marginBottom: 8 },
  metadata: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 6, color: '#666', flex: 1 },
  aiDetection: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#F3E5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  aiText: { marginLeft: 4, color: '#9C27B0', fontSize: 11 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
