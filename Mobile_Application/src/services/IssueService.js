import apiClient from './ApiClient';

class IssueService {
  async submitIssue(issueData) {
    return await apiClient.post('/issues', issueData);
  }

  async getMyIssues() {
    return await apiClient.get('/issues');
  }

  async getIssueById(issueId) {
    return await apiClient.get(`/issues/${issueId}`);
  }

  async getIssueHistory(issueId) {
    return await apiClient.get(`/issues/${issueId}/history`);
  }

  async getNearbyIssues(latitude, longitude, radius = 1000) {
    return await apiClient.get('/issues/nearby', {
      params: { latitude, longitude, radius },
    });
  }
}

export default new IssueService();
