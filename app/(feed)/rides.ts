import { RideData } from '@/store';

export const rides: RideData[] = [
  {
    id: '1',
    driver_id: 'driver1',
    origin: {
      label: 'Downtown Financial District',
      latitude: 40.7080,
      longitude: -74.0090,
    },
    destination: {
      label: 'Newark Airport (EWR)',
      latitude: 40.6895,
      longitude: -74.1745,
    },
    departure_time: '2024-07-08T15:30:00Z',
    arrival_time: '2024-07-08T16:15:00Z',
    seats_available: 4,
    seats_total: 4,
    price: 18,
    currency: 'USD',
    status: 'open',
    driver: {
      name: 'James Wilson',
      avatar_url: 'https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/',
      rating: 4.8,
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        plate: 'ABC123',
      },
    },
    distance_from_user: 0.5,
    destination_distance: 0.2,
  },
  {
    id: '2',
    driver_id: 'driver2',
    origin: {
      label: 'Uptown Manhattan',
      latitude: 40.7831,
      longitude: -73.9712,
    },
    destination: {
      label: 'Central Park West',
      latitude: 40.7829,
      longitude: -73.9654,
    },
    departure_time: '2024-07-09T09:00:00Z',
    arrival_time: '2024-07-09T09:30:00Z',
    seats_available: 0,
    seats_total: 3,
    price: 12,
    currency: 'USD',
    status: 'full',
    driver: {
      name: 'David Brown',
      avatar_url: 'https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/',
      rating: 4.6,
      vehicle: {
        make: 'Honda',
        model: 'Accord',
        year: 2021,
        color: 'Blue',
        plate: 'DEF456',
      },
    },
    distance_from_user: 1.2,
    destination_distance: 0.1,
  },
  {
    id: '3',
    driver_id: 'driver3',
    origin: {
      label: 'Harbor District',
      latitude: 40.7074,
      longitude: -74.0113,
    },
    destination: {
      label: 'Midtown Manhattan',
      latitude: 40.7549,
      longitude: -73.9840,
    },
    departure_time: '2024-07-13T10:00:00Z',
    arrival_time: '2024-07-13T10:45:00Z',
    seats_available: 2,
    seats_total: 4,
    price: 20,
    currency: 'USD',
    status: 'open',
    driver: {
      name: 'Michael Johnson',
      avatar_url: 'https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/',
      rating: 4.7,
      vehicle: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        color: 'White',
        plate: 'GHI789',
      },
    },
    distance_from_user: 0.8,
    destination_distance: 0.3,
  },
  {
    id: '4',
    driver_id: 'driver4',
    origin: {
      label: 'Suburban New Jersey',
      latitude: 40.6782,
      longitude: -74.2591,
    },
    destination: {
      label: 'Downtown Manhattan',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    departure_time: '2024-07-14T11:00:00Z',
    arrival_time: '2024-07-14T12:15:00Z',
    seats_available: 1,
    seats_total: 5,
    price: 22,
    currency: 'USD',
    status: 'open',
    driver: {
      name: 'Robert Green',
      avatar_url: 'https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/',
      rating: 4.9,
      vehicle: {
        make: 'Ford',
        model: 'Explorer',
        year: 2022,
        color: 'Black',
        plate: 'JKL012',
      },
    },
    distance_from_user: 2.1,
    destination_distance: 0.4,
  },
]; 