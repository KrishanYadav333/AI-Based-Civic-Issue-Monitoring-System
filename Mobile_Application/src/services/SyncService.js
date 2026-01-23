import * as Network from 'expo-network';
import IssueService from './IssueService';
import databaseService from './DatabaseService';
import notificationService from './NotificationService';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = [];
  }

  // Subscribe to sync events
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event) {
    this.listeners.forEach(callback => callback(event));
  }

  // Check network connectivity
  async isOnline() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected && networkState.isInternetReachable;
    } catch (error) {
      console.error('Network check error:', error);
      return false;
    }
  }

  // Start automatic sync
  startAutoSync(intervalMinutes = 5) {
    this.stopAutoSync();
    
    this.syncInterval = setInterval(async () => {
      await this.syncPendingIssues();
    }, intervalMinutes * 60 * 1000);

    // Initial sync
    this.syncPendingIssues();
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync all pending issues
  async syncPendingIssues() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    const online = await this.isOnline();
    if (!online) {
      console.log('Device is offline, skipping sync');
      return { success: false, message: 'Device is offline' };
    }

    this.isSyncing = true;
    this.notify({ type: 'sync_started' });

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      const syncQueue = await databaseService.getSyncQueue();
      console.log(`Syncing ${syncQueue.length} items...`);

      for (const item of syncQueue) {
        try {
          if (item.action === 'create') {
            await this.syncCreateIssue(item);
            successCount++;
          }
          // Can add update, delete actions here if needed
        } catch (error) {
          console.error(`Sync error for item ${item.id}:`, error);
          errorCount++;
          errors.push({ itemId: item.id, error: error.message });
          
          // Update retry count
          await databaseService.updateSyncQueueItem(
            item.id,
            item.retryCount + 1,
            error.message
          );
        }
      }

      const result = {
        success: errorCount === 0,
        successCount,
        errorCount,
        errors,
        message: `Synced ${successCount} items, ${errorCount} errors`,
      };

      this.notify({ 
        type: 'sync_completed', 
        data: result 
      });

      // Show notification if there were synced items
      if (successCount > 0) {
        await notificationService.scheduleNotification(
          'Sync Complete',
          `Successfully synced ${successCount} issue(s)`
        );
      }

      return result;
    } catch (error) {
      console.error('Sync process error:', error);
      this.notify({ 
        type: 'sync_error', 
        error: error.message 
      });
      
      return {
        success: false,
        message: error.message,
        errorCount: 1,
        errors: [{ error: error.message }],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync a single create issue request
  async syncCreateIssue(item) {
    // Prepare form data
    const formData = new FormData();
    formData.append('type', item.issueType);
    formData.append('description', item.description);
    formData.append('latitude', item.latitude);
    formData.append('longitude', item.longitude);
    
    if (item.address) {
      formData.append('address', item.address);
    }

    // Add image file
    const filename = item.imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: item.imageUri,
      name: filename,
      type,
    });

    // Submit to server
    const response = await IssueService.submitIssue(formData);

    if (response.success) {
      // Mark as synced in database
      await databaseService.markIssueAsSynced(
        item.issueLocalId,
        response.data.issueId
      );

      // Update with server data
      if (response.data.detectedType) {
        await databaseService.updateIssue(item.issueLocalId, {
          detectedType: response.data.detectedType,
          confidence: response.data.confidence,
          priority: response.data.priority,
          status: response.data.status,
        });
      }

      // Remove from sync queue
      await databaseService.removeSyncQueueItem(item.issueLocalId);

      console.log(`Successfully synced issue ${item.issueLocalId}`);
    } else {
      throw new Error(response.message || 'Server error');
    }
  }

  // Force sync now
  async forceSyncNow() {
    return await this.syncPendingIssues();
  }

  // Get sync status
  async getSyncStatus() {
    const stats = await databaseService.getStatistics();
    const online = await this.isOnline();
    
    return {
      online,
      isSyncing: this.isSyncing,
      totalIssues: stats.total,
      syncedIssues: stats.synced,
      pendingIssues: stats.pending,
      queueSize: stats.queueSize,
    };
  }

  // Clear failed sync items
  async clearFailedSyncs() {
    await databaseService.clearSyncQueue();
    this.notify({ type: 'queue_cleared' });
  }
}

const syncService = new SyncService();

export default syncService;
