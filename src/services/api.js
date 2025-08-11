const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update user profile');
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async patchUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update user profile');
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export default new ApiService();
