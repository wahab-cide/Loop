// File: store/index.ts (updated)
import { create } from "zustand";

// Updated types for ride search (matching your schema)
export interface RideData {
  id: string;
  driver_id: string;
  origin: {
    label: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    label: string;
    latitude: number;
    longitude: number;
  };
  departure_time: string;
  arrival_time?: string;
  seats_available: number;
  seats_total: number;
  price: number;
  currency: string;
  status: string;
  driver: {
    name: string; // Single name field from your schema
    avatar_url?: string; // Matches your schema
    rating: number; // Using rating_driver
    vehicle: {
      make: string;
      model: string;
      year: number;
      color: string;
      plate: string;
    };
  };
  distance_from_user: number;
  destination_distance: number;
}

export interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

export interface RideStore {
  rides: RideData[];
  selectedRide: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedRide: (rideId: string) => void;
  setRides: (rides: RideData[]) => void;
  clearSelectedRide: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  searchRides: (params: {
    destinationAddress: string;
    destinationLat: number;
    destinationLng: number;
    userLat: number;
    userLng: number;
    radiusKm?: number;
  }) => Promise<void>;
}

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // Clear selected ride when location changes
    const { clearSelectedRide } = useRideStore.getState();
    clearSelectedRide();
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    // Clear selected ride when destination changes
    const { clearSelectedRide } = useRideStore.getState();
    clearSelectedRide();
  },
}));

export const useRideStore = create<RideStore>((set, get) => ({
  rides: [],
  selectedRide: null,
  isLoading: false,
  error: null,
  
  setSelectedRide: (rideId: string) =>
    set(() => ({ selectedRide: rideId })),
    
  setRides: (rides: RideData[]) => 
    set(() => ({ rides, error: null })),
    
  clearSelectedRide: () => 
    set(() => ({ selectedRide: null })),
    
  setLoading: (loading: boolean) => 
    set(() => ({ isLoading: loading })),
    
  setError: (error: string | null) => 
    set(() => ({ error, isLoading: false })),

  searchRides: async (params) => {
    set(() => ({ isLoading: true, error: null }));
    
    try {
      console.log('Making API call with params:', params);
      
      // Make actual API call to search for rides
      const response = await fetch('/(api)/rides/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search rides');
      }
      
      console.log('Search completed successfully with', data.rides.length, 'rides');
      
      set(() => ({ 
        rides: data.rides, 
        isLoading: false, 
        error: null 
      }));
    } catch (error) {
      console.error('Search rides error:', error);
      set(() => ({ 
        error: error instanceof Error ? error.message : 'Failed to search rides',
        isLoading: false,
        rides: []
      }));
    }
  },
}));