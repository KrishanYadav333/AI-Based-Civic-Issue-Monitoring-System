import api from './api';

/**
 * Notification Service
 * Handles fetching and managing notifications
 */

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications?unread_only=true');
      return response.data?.data?.length || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

/**
 * Democracy/Voting Service
 */
export const democracyService = {
  /**
   * Vote on an issue
   */
  voteOnIssue: async (issueId) => {
    try {
      const response = await api.post(`/premium/issues/${issueId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error voting on issue:', error);
      throw error;
    }
  },

  /**
   * Get vote status for an issue
   */
  getVoteStatus: async (issueId) => {
    try {
      const response = await api.get(`/premium/issues/${issueId}/vote-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vote status:', error);
      return { hasVoted: false };
    }
  }
};

/**
 * Trust Service
 */
export const trustService = {
  /**
   * Get user trust score (Admin only)
   */
  getTrustScore: async (userId) => {
    try {
      const response = await api.get(`/premium/users/${userId}/trust`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trust score:', error);
      return { trust_score: 2.5, triage_action: 'standard' };
    }
  }
};

/**
 * Budget Service
 */
export const budgetService = {
  /**
   * Estimate cost for issue type and severity
   */
  estimateCost: async (issueType, severity) => {
    try {
      const response = await api.post('/premium/budget/estimate', { issueType, severity });
      return response.data;
    } catch (error) {
      console.error('Error estimating cost:', error);
      throw error;
    }
  }
};

/**
 * Cluster Service
 */
export const clusterService = {
  /**
   * Get work clusters for engineers
   */
  getClusters: async (radius = 200) => {
    try {
      const response = await api.get(`/premium/clusters?radius=${radius}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clusters:', error);
      return { count: 0, clusters: [] };
    }
  }
};

export default {
  notification: notificationService,
  democracy: democracyService,
  trust: trustService,
  budget: budgetService,
  cluster: clusterService
};
