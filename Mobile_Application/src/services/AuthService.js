import apiClient from './ApiClient';

class AuthService {
  async login(username, password) {
    return await apiClient.post('/auth/login', { username, password });
  }

  async register(userData) {
    return await apiClient.post('/auth/register', userData);
  }

  async getCurrentUser() {
    return await apiClient.get('/auth/me');
  }

  async changePassword(oldPassword, newPassword) {
    return await apiClient.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  async logout() {
    // Clear local storage handled in authSlice
    return Promise.resolve();
  }
}

export default new AuthService();
