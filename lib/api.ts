const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const api = {
  // Auth endpoints
  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  // User profile endpoints
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  // Asset endpoints
  getAssets: async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log("getting assets")
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'GET',
        headers: getAuthHeaders(),
        signal: controller.signal,
        credentials: 'include'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch assets');
      }

      const data = await response.json();
      console.log('API Data:', data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      console.error('API Error:', error);
      throw error;
    }
  },

  getAsset: async (gpsId: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${gpsId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch asset');
    }
    return response.json();
  },

  createAsset: async (assetData: {
    name: string;
    gpsId: string;
    type: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create asset');
    }
    return response.json();
  },

  updateAssetLocation: async (locationData: {
    gpsId: string;
    latitude: number;
    longitude: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/assets/location`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update location');
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

  deleteAsset: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  },

  updateAsset: async (id: string, assetData: Partial<Asset>) => {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  createGpsEntry: async () => {
    const delhiGpsEntry = {
      gpsId: "GP_NO_01012345",
      location: {
        latitude: 28.6139,  // Delhi's coordinates
        longitude: 77.2090,
        timestamp: new Date().toISOString()
      },
      status: "active"
    };

    const response = await fetch(`${API_BASE_URL}/gps/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(delhiGpsEntry),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create GPS entry');
    }
    return response.json();
  },

  validateGpsId: async (gpsId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/gps/validate/${gpsId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'GPS validation failed');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate GPS ID');
    }
  },
} 