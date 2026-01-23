import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button, FAB, Chip, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import databaseService from '../../services/DatabaseService';
import syncService from '../../services/SyncService';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const isOnline = useSelector(state => state.offline.isOnline);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    loadData();
    
    // Subscribe to sync events
    const unsubscribe = syncService.subscribe(event => {
      if (event.type === 'sync_started') setSyncing(true);
      if (event.type === 'sync_completed' || event.type === 'sync_error') {
        setSyncing(false);
        loadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const dbStats = await databaseService.getStatistics();
      setStats(dbStats);

      const issues = await databaseService.getAllIssues();
      setRecentIssues(issues.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (isOnline) {
      await syncService.forceSyncNow();
    }
    setRefreshing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncService.forceSyncNow();
    setSyncing(false);
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

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium">Welcome back!</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {user?.name || 'Field Surveyor'}
            </Text>
          </View>
          <View style={styles.connectionBadge}>
            <Ionicons 
              name={isOnline ? 'cloud-done' : 'cloud-offline'} 
              size={20} 
              color={isOnline ? '#4CAF50' : '#FF9800'} 
            />
            <Text style={styles.connectionText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Statistics Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statNumber}>{stats.total}</Text>
                <Text variant="bodySmall">Total Issues</Text>
              </Card.Content>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statNumber}>{stats.synced}</Text>
                <Text variant="bodySmall">Synced</Text>
              </Card.Content>
            </Card>
            
            <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.statNumber}>{stats.pending}</Text>
                <Text variant="bodySmall">Pending</Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Sync Status */}
        {stats && stats.queueSize > 0 && (
          <Card style={styles.syncCard}>
            <Card.Content>
              <View style={styles.syncRow}>
                <Ionicons name="sync" size={24} color="#2196F3" />
                <View style={styles.syncInfo}>
                  <Text variant="titleMedium">Sync Queue</Text>
                  <Text variant="bodySmall">{stats.queueSize} items waiting to sync</Text>
                </View>
                <Button 
                  mode="contained" 
                  onPress={handleSync}
                  disabled={!isOnline || syncing}
                  loading={syncing}
                >
                  Sync Now
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Camera')}
            >
              <Ionicons name="camera" size={32} color="#2196F3" />
              <Text style={styles.actionText}>Report Issue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('History')}
            >
              <Ionicons name="list" size={32} color="#4CAF50" />
              <Text style={styles.actionText}>My Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={32} color="#FF9800" />
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Issues */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Recent Issues</Text>
            <Button onPress={() => navigation.navigate('History')}>View All</Button>
          </View>
          
          {recentIssues.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No issues reported yet</Text>
                <Button mode="contained" onPress={() => navigation.navigate('Camera')}>
                  Report First Issue
                </Button>
              </Card.Content>
            </Card>
          ) : (
            recentIssues.map((issue, index) => (
              <Card 
                key={issue.localId} 
                style={styles.issueCard}
                onPress={() => navigation.navigate('IssueDetail', { issue })}
              >
                <Card.Content>
                  <View style={styles.issueHeader}>
                    <View style={styles.issueTitleRow}>
                      <Text variant="titleSmall">{issue.issueType}</Text>
                      <Chip 
                        compact 
                        style={{ backgroundColor: getStatusColor(issue.status) }}
                        textStyle={{ color: '#fff', fontSize: 10 }}
                      >
                        {issue.synced ? issue.status : 'Local'}
                      </Chip>
                    </View>
                    <Text variant="bodySmall" style={styles.issueDate}>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {issue.description && (
                    <Text variant="bodySmall" numberOfLines={2} style={styles.issueDesc}>
                      {issue.description}
                    </Text>
                  )}
                  <View style={styles.issueFooter}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text variant="bodySmall" style={styles.issueLocation} numberOfLines={1}>
                      {issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
        label="Report"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionText: {
    marginLeft: 6,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
  },
  syncCard: {
    margin: 10,
    backgroundColor: '#E3F2FD',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncInfo: {
    flex: 1,
    marginLeft: 12,
  },
  section: {
    padding: 10,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
  },
  emptyCard: {
    marginTop: 10,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    marginVertical: 15,
  },
  issueCard: {
    marginBottom: 10,
  },
  issueHeader: {
    marginBottom: 8,
  },
  issueTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueDate: {
    color: '#666',
  },
  issueDesc: {
    color: '#666',
    marginBottom: 8,
  },
  issueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issueLocation: {
    marginLeft: 4,
    color: '#666',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
