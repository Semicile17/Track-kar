export interface Asset {
  id: string;
  name: string;
  assetId: string;
  gpsId: string;
  type: string;
  status: 'active' | 'inactive';
  location: {
    latitude: number;
    longitude: number;
    timestamp?: string;
  };
} 