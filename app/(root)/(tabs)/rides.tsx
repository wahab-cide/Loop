// app/(root)/(tabs)/rides.tsx
import { icons } from '@/constants';
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RideData {
  bookingId: string;
  rideId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime?: string;
  bookingDate: string;
  lastUpdated: string;
  seatsBooked: number;
  pricePerSeat: number;
  totalPaid: number;
  currency: string;
  bookingStatus: 'pending' | 'paid' | 'completed' | 'cancelled';
  rideStatus: 'open' | 'full' | 'completed' | 'cancelled';
  coordinates: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
  };
  driver: {
    id: string;
    clerkId: string;
    name: string;
    avatar?: string;
    phone?: string;
    rating: number;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    displayName: string;
  } | null;
  capacity: {
    total: number;
    available: number;
  };
}

const Rides = () => {
  const { user } = useUser();
  const [rides, setRides] = useState<RideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching rides for user:', user.id);
      const response = await fetch(`/(api)/rides/user/${user.id}`);
      const data = await response.json();

      console.log('Rides API response:', data);

      if (data.success) {
        setRides(data.rides);
      } else {
        console.error('Failed to fetch rides:', data.error);
        Alert.alert('Error', data.error || 'Failed to fetch your rides');
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert('Error', 'Failed to fetch your rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'paid':
        return '#4CAF50'; // Green
      case 'completed':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Payment';
      case 'paid':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleRidePress = (ride: RideData) => {
    // Navigate to ride details or show more info
    const rideInfo = [
      `Booking ID: ${ride.bookingId}`,
      `Status: ${getStatusText(ride.bookingStatus)}`,
      `Amount Paid: ${ride.currency} ${ride.totalPaid.toFixed(2)}`,
      `Driver: ${ride.driver.name}`,
      `Rating: ${ride.driver.rating}/5.0`,
    ];

    if (ride.vehicle) {
      rideInfo.push(`Vehicle: ${ride.vehicle.displayName}`);
      rideInfo.push(`Plate: ${ride.vehicle.plate}`);
    }

    Alert.alert(
      'Ride Details',
      rideInfo.join('\n'),
      [{ text: 'OK' }]
    );
  };

  const renderRideCard = ({ item }: { item: RideData }) => (
    <TouchableOpacity
      onPress={() => handleRidePress(item)}
      className="bg-white rounded-lg p-4 mb-3 mx-4 shadow-sm border border-gray-100"
    >
      {/* Status Badge */}
      <View className="flex-row justify-between items-start mb-3">
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(item.bookingStatus) + '20' }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: getStatusColor(item.bookingStatus) }}
          >
            {getStatusText(item.bookingStatus)}
          </Text>
        </View>
        <Text className="text-xs text-gray-500">
          {formatDate(item.bookingDate)}
        </Text>
      </View>

      {/* Route Information */}
      <View className="flex-row items-center mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
            <Text className="text-sm font-medium text-gray-800 flex-1" numberOfLines={1}>
              {item.from}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-3" />
            <Text className="text-sm font-medium text-gray-800 flex-1" numberOfLines={1}>
              {item.to}
            </Text>
          </View>
        </View>
      </View>

      {/* Departure Time */}
      <View className="flex-row items-center mb-3">
        <Image source={icons.clock} className="w-4 h-4 mr-2" />
        <Text className="text-sm text-gray-600">
          {formatDate(item.departureTime)} at {formatTime(item.departureTime)}
        </Text>
      </View>

      {/* Driver and Vehicle Info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ 
              uri: item.driver.avatar || 'https://via.placeholder.com/40x40' 
            }}
            className="w-8 h-8 rounded-full mr-3"
          />
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-800">
              {item.driver.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {item.vehicle?.displayName || 'Vehicle info unavailable'}
            </Text>
            {item.driver.rating && (
              <Text className="text-xs text-yellow-600">
                ⭐ {item.driver.rating.toFixed(1)}
              </Text>
            )}
          </View>
        </View>
        
        <View className="items-end">
          <Text className="text-sm font-bold text-gray-800">
            {item.currency} {item.totalPaid.toFixed(2)}
          </Text>
          <Text className="text-xs text-gray-500">
            {item.seatsBooked} seat{item.seatsBooked > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <Image
        source={icons.list}
        className="w-24 h-24 mb-4 opacity-50"
      />
      <Text className="text-xl font-semibold text-gray-800 mb-2">
        No Rides Yet
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        When you book rides, they'll appear here. Start exploring available rides!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0286FF" />
          <Text className="text-gray-500 mt-4">Loading your rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">My Rides</Text>
          <Text className="text-gray-500 mt-1">
            {rides.length} ride{rides.length !== 1 ? 's' : ''} total
          </Text>
        </View>

        {/* Rides List */}
        <FlatList
          data={rides}
          renderItem={renderRideCard}
          keyExtractor={(item) => item.bookingId}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 16,
            flexGrow: 1,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Rides;