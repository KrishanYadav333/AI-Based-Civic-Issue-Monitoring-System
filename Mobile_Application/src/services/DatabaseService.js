import * as SQLite from 'expo-sqlite';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync('civicIssues.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async createTables() {
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        localId TEXT UNIQUE NOT NULL,
        serverId INTEGER,
        imageUri TEXT NOT NULL,
        issueType TEXT NOT NULL,
        description TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        detectedType TEXT,
        confidence REAL,
        status TEXT DEFAULT 'pending',
        priority TEXT,
        synced INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS syncQueue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issueLocalId TEXT NOT NULL,
        action TEXT NOT NULL,
        retryCount INTEGER DEFAULT 0,
        lastAttempt TEXT,
        error TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (issueLocalId) REFERENCES issues(localId) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expiresAt TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_issues_synced ON issues(synced);
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
      CREATE INDEX IF NOT EXISTS idx_syncQueue_issueLocalId ON syncQueue(issueLocalId);
    `);
  }

  // Issue Operations
  async saveIssue(issueData) {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `INSERT INTO issues (
        localId, imageUri, issueType, description, latitude, longitude,
        address, detectedType, confidence, status, synced, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        localId,
        issueData.imageUri,
        issueData.issueType,
        issueData.description || '',
        issueData.latitude,
        issueData.longitude,
        issueData.address || '',
        issueData.detectedType || null,
        issueData.confidence || null,
        'pending',
        0,
        now,
        now,
      ]
    );

    // Add to sync queue
    await this.addToSyncQueue(localId, 'create');

    return { localId, id: result.lastInsertRowId };
  }

  async getIssue(localId) {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM issues WHERE localId = ?',
      [localId]
    );
    return result;
  }

  async getAllIssues() {
    const result = await this.db.getAllAsync(
      'SELECT * FROM issues ORDER BY createdAt DESC'
    );
    return result;
  }

  async getUnsyncedIssues() {
    const result = await this.db.getAllAsync(
      'SELECT * FROM issues WHERE synced = 0 ORDER BY createdAt ASC'
    );
    return result;
  }

  async updateIssue(localId, updates) {
    const now = new Date().toISOString();
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await this.db.runAsync(
      `UPDATE issues SET ${setClause}, updatedAt = ? WHERE localId = ?`,
      [...values, now, localId]
    );
  }

  async markIssueAsSynced(localId, serverId) {
    await this.db.runAsync(
      'UPDATE issues SET synced = 1, serverId = ?, updatedAt = ? WHERE localId = ?',
      [serverId, new Date().toISOString(), localId]
    );
  }

  async deleteIssue(localId) {
    await this.db.runAsync('DELETE FROM issues WHERE localId = ?', [localId]);
  }

  // Sync Queue Operations
  async addToSyncQueue(issueLocalId, action) {
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      'INSERT INTO syncQueue (issueLocalId, action, createdAt) VALUES (?, ?, ?)',
      [issueLocalId, action, now]
    );
  }

  async getSyncQueue() {
    const result = await this.db.getAllAsync(
      `SELECT sq.*, i.* 
       FROM syncQueue sq 
       JOIN issues i ON sq.issueLocalId = i.localId 
       WHERE sq.retryCount < 3 
       ORDER BY sq.createdAt ASC`
    );
    return result;
  }

  async updateSyncQueueItem(id, retryCount, error = null) {
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      'UPDATE syncQueue SET retryCount = ?, lastAttempt = ?, error = ? WHERE id = ?',
      [retryCount, now, error, id]
    );
  }

  async removeSyncQueueItem(issueLocalId) {
    await this.db.runAsync(
      'DELETE FROM syncQueue WHERE issueLocalId = ?',
      [issueLocalId]
    );
  }

  async clearSyncQueue() {
    await this.db.runAsync('DELETE FROM syncQueue');
  }

  // Cache Operations
  async setCache(key, value, expiresInMinutes = 60) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60000).toISOString();
    
    await this.db.runAsync(
      'INSERT OR REPLACE INTO cache (key, value, expiresAt, createdAt) VALUES (?, ?, ?, ?)',
      [key, JSON.stringify(value), expiresAt, now.toISOString()]
    );
  }

  async getCache(key) {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM cache WHERE key = ? AND (expiresAt IS NULL OR expiresAt > ?)',
      [key, new Date().toISOString()]
    );
    
    return result ? JSON.parse(result.value) : null;
  }

  async clearCache(key = null) {
    if (key) {
      await this.db.runAsync('DELETE FROM cache WHERE key = ?', [key]);
    } else {
      await this.db.runAsync('DELETE FROM cache');
    }
  }

  async clearExpiredCache() {
    await this.db.runAsync(
      'DELETE FROM cache WHERE expiresAt IS NOT NULL AND expiresAt <= ?',
      [new Date().toISOString()]
    );
  }

  // Statistics
  async getStatistics() {
    const stats = {};
    
    const totalResult = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM issues'
    );
    stats.total = totalResult.count;
    
    const syncedResult = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM issues WHERE synced = 1'
    );
    stats.synced = syncedResult.count;
    
    const pendingResult = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM issues WHERE synced = 0'
    );
    stats.pending = pendingResult.count;
    
    const queueResult = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM syncQueue'
    );
    stats.queueSize = queueResult.count;
    
    return stats;
  }

  // Clear all data
  async clearAllData() {
    await this.db.execAsync(`
      DELETE FROM issues;
      DELETE FROM syncQueue;
      DELETE FROM cache;
    `);
  }

  // Close database
  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

// Singleton instance
const databaseService = new DatabaseService();

export default databaseService;
