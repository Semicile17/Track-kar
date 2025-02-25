const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Signup failed');
    }

    return response.json();
  },

  // GPS device endpoints
  submitGpsApplication: async (formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    vehicleCount: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/gps/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error('Application submission failed');
    return response.json();
  },

  verifyGpsDevice: async (gpsId: string, plateNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/gps/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ gpsId, plateNumber }),
    });
    if (!response.ok) throw new Error('GPS verification failed');
    return response.json();
  },

  // Location tracking endpoints
  getVehicleLocation: async (vehicleId: string) => {
    const response = await fetch(`${API_BASE_URL}/location/${vehicleId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch location');
    return response.json();
  },

  getVehicleHistory: async (vehicleId: string, startDate: string, endDate: string) => {
    const response = await fetch(
      `${API_BASE_URL}/location/${vehicleId}/history?start=${startDate}&end=${endDate}`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error('Failed to fetch location history');
    return response.json();
  },

  // Profile endpoints
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    company?: string;
    role?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
} 