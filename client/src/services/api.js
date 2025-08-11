const API_BASE_URL = '/api';

class ApiService {
  async listFacilities() {
    const res = await fetch(`${API_BASE_URL}/facilities`);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  }

  async getFacility(facilityId) {
    const res = await fetch(`${API_BASE_URL}/facilities/${facilityId}`);
    if (!res.ok) throw new Error('Failed to fetch facility');
    return res.json();
  }

  async getFacilityCourts(facilityId) {
    const res = await fetch(`${API_BASE_URL}/facilities/${facilityId}/courts`);
    if (!res.ok) throw new Error('Failed to fetch courts');
    return res.json();
  }

  async createBooking(payload) {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Failed to create booking');
    }
    return res.json();
  }

  async listBookings(userId) {
    const url = new URL(`${API_BASE_URL}/bookings`, window.location.origin);
    if (userId) url.searchParams.set('userId', userId);
    const res = await fetch(url.toString().replace(window.location.origin, ''));
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  }
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
