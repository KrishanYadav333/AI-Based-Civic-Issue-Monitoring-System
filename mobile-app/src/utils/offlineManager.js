import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

const SYNC_QUEUE_KEY = '@civic_sync_queue';
const OFFLINE_DATA_KEY = '@civic_offline_data';
const LAST_SYNC_KEY = '@civic_last_sync';

class OfflineManager {
  constructor() {
    this.syncQueue = [];
    this.isOnline = true;
    this.isSyncing = false;
    
    // Monitor network status
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      console.log('Network status changed:', this.isOnline ? 'ONLINE' : 'OFFLINE');
      
      // Auto-sync when coming back online
      if (wasOffline && this.isOnline) {
        this.syncPendingActions();
      }
    });
    
    // Load sync queue on init
    this.loadSyncQueue();
  }

  /**
   * Check if device is online
   */
  async isDeviceOnline() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }

  /**
   * Load sync queue from storage
   */
  async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      this.syncQueue = queueData ? JSON.parse(queueData) : [];
      console.log(`Loaded ${this.syncQueue.length} pending actions from queue`);
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Save sync queue to storage
   */
  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Add action to sync queue
   */
  async addToQueue(action) {
    const queueItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: action.type,
      data: action.data,
      retries: 0,
      status: 'pending'
    };

    this.syncQueue.push(queueItem);
    await this.saveSyncQueue();
    
    console.log(`Added action to queue: ${action.type}`, queueItem.id);
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return queueItem.id;
  }

  /**
   * Sync all pending actions
   */
  async syncPendingActions() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return { success: true, synced: 0 };
    }

    if (!(await this.isDeviceOnline())) {
      console.log('Device offline, skipping sync');
      return { success: false, error: 'Device offline' };
    }

    this.isSyncing = true;
    console.log(`Starting sync of ${this.syncQueue.length} items...`);

    let syncedCount = 0;
    const failedItems = [];

    for (const item of [...this.syncQueue]) {
      try {
        const result = await this.syncSingleAction(item);
        
        if (result.success) {
          // Remove from queue
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
          syncedCount++;
        } else {
          // Increment retry count
          item.retries++;
          item.lastError = result.error;
          
          // Remove if max retries exceeded
          if (item.retries >= 5) {
            console.error(`Max retries exceeded for item ${item.id}, removing`);
            this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
            failedItems.push(item);
          }
        }
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        item.retries++;
        
        if (item.retries >= 5) {
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
          failedItems.push(item);
        }
      }
    }

    await this.saveSyncQueue();
    await this.updateLastSyncTime();
    
    this.isSyncing = false;
    
    console.log(`Sync complete: ${syncedCount} synced, ${failedItems.length} failed`);
    
    return {
      success: true,
      synced: syncedCount,
      failed: failedItems.length,
      remaining: this.syncQueue.length
    };
  }

  /**
   * Sync single action
   */
  async syncSingleAction(item) {
    const { API_URL } = require('../config');
    const token = await AsyncStorage.getItem('@civic_auth_token');

    try {
      switch (item.action) {
        case 'CREATE_ISSUE':
          return await this.syncCreateIssue(item.data, token);
        
        case 'UPDATE_ISSUE':
          return await this.syncUpdateIssue(item.data, token);
        
        case 'RESOLVE_ISSUE':
          return await this.syncResolveIssue(item.data, token);
        
        default:
          console.warn(`Unknown action type: ${item.action}`);
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync issue creation
   */
  async syncCreateIssue(data, token) {
    const { API_URL } = require('../config');
    
    const formData = new FormData();
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('description', data.description || '');
    
    if (data.image) {
      formData.append('image', {
        uri: data.image.uri,
        type: 'image/jpeg',
        name: 'issue.jpg'
      });
    }

    const response = await fetch(`${API_URL}/api/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  }

  /**
   * Sync issue resolution
   */
  async syncResolveIssue(data, token) {
    const { API_URL } = require('../config');
    
    const formData = new FormData();
    formData.append('notes', data.notes || '');
    
    if (data.resolutionImage) {
      formData.append('resolution_image', {
        uri: data.resolutionImage.uri,
        type: 'image/jpeg',
        name: 'resolution.jpg'
      });
    }

    const response = await fetch(`${API_URL}/api/issues/${data.issueId}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  }

  /**
   * Save offline data
   */
  async saveOfflineData(key, data) {
    try {
      const offlineData = await this.getOfflineData();
      offlineData[key] = {
        data,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  /**
   * Get offline data
   */
  async getOfflineData(key = null) {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      const offlineData = data ? JSON.parse(data) : {};
      
      if (key) {
        return offlineData[key]?.data || null;
      }
      
      return offlineData;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return key ? null : {};
    }
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(key = null) {
    try {
      if (key) {
        const offlineData = await this.getOfflineData();
        delete offlineData[key];
        await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
      } else {
        await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
      }
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime() {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime() {
    try {
      const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return time ? new Date(time) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      lastSync: await this.getLastSyncTime()
    };
  }

  /**
   * Clear all offline data and queue
   */
  async clearAll() {
    this.syncQueue = [];
    await AsyncStorage.multiRemove([SYNC_QUEUE_KEY, OFFLINE_DATA_KEY, LAST_SYNC_KEY]);
    console.log('Cleared all offline data');
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }
}

// Singleton instance
export default new OfflineManager();
