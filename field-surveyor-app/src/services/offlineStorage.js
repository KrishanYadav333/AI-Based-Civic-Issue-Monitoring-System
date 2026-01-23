import localforage from 'localforage';

// Initialize localForage instances
const issuesDB = localforage.createInstance({
  name: 'civic-issues',
  storeName: 'issues',
});

const syncQueueDB = localforage.createInstance({
  name: 'civic-issues',
  storeName: 'syncQueue',
});

class OfflineStorageService {
  // Save issue locally
  async saveIssue(issue) {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const issueData = {
      ...issue,
      localId,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await issuesDB.setItem(localId, issueData);
    await this.addToSyncQueue(issueData);
    
    return issueData;
  }

  // Get all issues
  async getAllIssues() {
    const issues = [];
    await issuesDB.iterate((value) => {
      issues.push(value);
    });
    return issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get unsynced issues
  async getUnsyncedIssues() {
    const issues = await this.getAllIssues();
    return issues.filter(issue => !issue.synced);
  }

  // Mark issue as synced
  async markAsSynced(localId, serverId) {
    const issue = await issuesDB.getItem(localId);
    if (issue) {
      issue.synced = true;
      issue.serverId = serverId;
      await issuesDB.setItem(localId, issue);
    }
    await syncQueueDB.removeItem(localId);
  }

  // Sync queue operations
  async addToSyncQueue(issue) {
    await syncQueueDB.setItem(issue.localId, {
      ...issue,
      retryCount: 0,
      lastAttempt: null,
    });
  }

  async getSyncQueue() {
    const queue = [];
    await syncQueueDB.iterate((value) => {
      if (value.retryCount < 3) {
        queue.push(value);
      }
    });
    return queue;
  }

  async updateSyncQueueItem(localId, updates) {
    const item = await syncQueueDB.getItem(localId);
    if (item) {
      await syncQueueDB.setItem(localId, { ...item, ...updates });
    }
  }

  // Statistics
  async getStatistics() {
    const allIssues = await this.getAllIssues();
    const synced = allIssues.filter(i => i.synced).length;
    const pending = allIssues.filter(i => !i.synced).length;
    const queueSize = (await this.getSyncQueue()).length;

    return {
      total: allIssues.length,
      synced,
      pending,
      queueSize,
    };
  }

  // Clear all data
  async clearAll() {
    await issuesDB.clear();
    await syncQueueDB.clear();
  }
}

export default new OfflineStorageService();
