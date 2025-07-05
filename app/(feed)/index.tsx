// app/(root)/(tabs)/home.tsx
import { PlusButton } from '@/components/PlusButton';
import RideCard from '@/components/RideCard';
import { SignOutButton } from '@/components/SignOutButton';
import { icons } from '@/constants';
import { RideData } from '@/store';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const chips = [
  { label: 'All' },
  { label: 'Today' },
  { label: 'Tomorrow' },
  { label: 'This Week' },
  { label: 'Morning' },
  { label: 'Evening' },
];

interface Ride extends RideData {
  distance_km?: number;
}

const FeedScreen = () => {
  const [activeChip, setActiveChip] = useState('All');
  const [rides, setRides] = useState<Ride[]>([]);
  const [allRides, setAllRides] = useState<Ride[]>([]); // Store all rides for filtering
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Getting location...');
  
  const router = useRouter();
  const { user } = useUser();

  // Get user's location
  const getCurrentLocation = async () => {
    try {
      console.log('Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationStatus('Location permission denied');
        // Still show interface but with message
        setLoading(false);
        return null;
      }

      console.log('Getting current location...');
      setLocationStatus('Getting your location...');
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      console.log('Location obtained:', coords);
      setLocation(coords);
      setLocationStatus('Location found');
      
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationStatus('Unable to get location');
      setLoading(false);
      return null;
    }
  };

  // Fetch nearby rides
  const fetchNearbyRides = async (userLocation?: { latitude: number; longitude: number }) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const coords = userLocation || location;
    if (!coords) {
      console.log('No location available for fetching rides');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching nearby rides...');
      const response = await fetch(
        `/(api)/rides/feed?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=50&clerkId=${user.id}`
      );
      
      const data = await response.json();
      console.log('Rides feed response:', data);

      if (data.success) {
        // Transform API response to match RideData interface
        const transformedRides: Ride[] = data.rides.map((ride: any) => ({
          id: ride.id,
          origin: {
            label: ride.origin_address,
            latitude: ride.origin_latitude,
            longitude: ride.origin_longitude,
          },
          destination: {
            label: ride.destination_address,
            latitude: ride.destination_latitude,
            longitude: ride.destination_longitude,
          },
          departure_time: ride.departure_time,
          price: ride.fare_price,
          seats_available: ride.seats_available,
          seats_total: ride.seats_total,
          distance_from_user: ride.distance_km || 0,
          distance_km: ride.distance_km,
          driver: {
            id: ride.driver.id,
            name: ride.driver.name,
            avatar_url: ride.driver.profile_image_url,
            rating: ride.driver.rating,
            vehicle: ride.car ? {
              make: ride.car.make,
              model: ride.car.model,
              year: ride.car.year,
              color: ride.car.color,
              plate: ride.car.plate,
            } : {
              make: 'Unknown',
              model: 'Vehicle',
              year: new Date().getFullYear(),
              color: 'Gray',
              plate: 'N/A',
            }
          }
        }));

        setAllRides(transformedRides);
        setRides(transformedRides); // Initially show all rides
        console.log(`Loaded ${transformedRides.length} nearby rides`);
      } else {
        console.error('Failed to fetch rides:', data.error);
        if (data.error !== 'User not found') {
          Alert.alert('Error', data.error || 'Failed to fetch nearby rides');
        }
      }
    } catch (error) {
      console.error('Error fetching nearby rides:', error);
      Alert.alert('Error', 'Failed to fetch nearby rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter rides based on active chip
  const filterRides = (chipLabel: string, ridesToFilter = allRides) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let filtered = ridesToFilter;

    switch (chipLabel) {
      case 'Today':
        filtered = ridesToFilter.filter(ride => {
          const rideDate = new Date(ride.departure_time);
          return rideDate >= today && rideDate < tomorrow;
        });
        break;
      case 'Tomorrow':
        filtered = ridesToFilter.filter(ride => {
          const rideDate = new Date(ride.departure_time);
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          return rideDate >= tomorrow && rideDate < dayAfterTomorrow;
        });
        break;
      case 'This Week':
        filtered = ridesToFilter.filter(ride => {
          const rideDate = new Date(ride.departure_time);
          return rideDate >= today && rideDate < nextWeek;
        });
        break;
      case 'Morning':
        filtered = ridesToFilter.filter(ride => {
          const hour = new Date(ride.departure_time).getHours();
          return hour >= 6 && hour < 12;
        });
        break;
      case 'Evening':
        filtered = ridesToFilter.filter(ride => {
          const hour = new Date(ride.departure_time).getHours();
          return hour >= 17 && hour < 23;
        });
        break;
      default: // 'All'
        filtered = ridesToFilter;
    }

    setRides(filtered);
  };

  // Handle chip selection
  const handleChipPress = (chipLabel: string) => {
    setActiveChip(chipLabel);
    filterRides(chipLabel);
  };

  // Initialize location and fetch rides
  useEffect(() => {
    const initialize = async () => {
      const userLocation = await getCurrentLocation();
      if (userLocation) {
        await fetchNearbyRides(userLocation);
      }
    };

    initialize();
  }, [user?.id]);

  // Filter rides when allRides changes
  useEffect(() => {
    filterRides(activeChip);
  }, [allRides]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await fetchNearbyRides();
    } else {
      const userLocation = await getCurrentLocation();
      if (userLocation) {
        await fetchNearbyRides(userLocation);
      } else {
        setRefreshing(false);
      }
    }
  };

  // Handle ride card press
  const handleRidePress = (rideId: string) => {
    console.log('Navigating to book-ride for ride:', rideId);
    router.push(`/(root)/book-ride?rideId=${rideId}`);
  };

  const renderRideCard = ({ item }: { item: Ride }) => {
    return (
      <RideCard
        ride={item}
        variant="feed"
        onPress={handleRidePress}
        showDistance={true}
        showOrigin={true}
        showDestination={true}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#fff' }}>
      {/* TopBar */}
      <View className="flex-row items-center justify-between px-4 h-[56px]">
        {/* Left: SignOut and Logo */}
        <View className="flex-row items-center">
          <SignOutButton>
            <Image source={icons.signOut} className="w-7 h-7 mr-3" />
          </SignOutButton>
          <View className="w-8 h-8 rounded-full bg-black items-center justify-center">
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
        </View>
        <View className="flex-row items-center space-x-2">
          {/* Search Button */}
          <TouchableOpacity
            className="w-16 h-10 rounded-full bg-[#EFEFEF] items-center justify-center mr-2"
            onPress={() => router.push('/search' as any)}
            activeOpacity={0.8}
          >
            <Image source={icons.search} className="w-7 h-7" style={{ tintColor: '#000' }} />
          </TouchableOpacity>
          {/* Post Button */}
          <PlusButton />
        </View>
      </View>

      {/* Location Status */}
      {!location && (
        <View className="px-4 py-2 bg-blue-50">
          <Text className="text-xs text-blue-600 text-center">
            {locationStatus} {locationStatus === 'Location permission denied' && '• Tap to enable'}
          </Text>
        </View>
      )}

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip.label}
            className={`h-8 px-4 rounded-full border ${activeChip === chip.label ? 'bg-black border-black' : 'bg-[#EFEFEF] border-[#DDD]'} justify-center items-center`}
            onPress={() => handleChipPress(chip.label)}
            activeOpacity={0.8}
          >
            <Text className={`text-[12px] ${activeChip === chip.label ? 'text-white' : 'text-black'}`}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rides Count */}
      <View className="px-4 py-2">
        <Text className="text-gray-500 text-sm">
          {loading ? 'Loading rides...' : `${rides.length} ride${rides.length !== 1 ? 's' : ''} ${activeChip === 'All' ? 'nearby' : activeChip.toLowerCase()}`}
        </Text>
      </View>

      {/* Ride Feed */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-4">{locationStatus}</Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={renderRideCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center px-6 py-12">
              <Image
                source={icons.search}
                className="w-16 h-16 mb-4 opacity-30"
              />
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                No Rides Found
              </Text>
              <Text className="text-gray-500 text-center mb-4">
                {location 
                  ? `No rides available ${activeChip === 'All' ? 'in your area' : activeChip.toLowerCase()}. Try a different filter or check back later.`
                  : 'Enable location access to see nearby rides.'
                }
              </Text>
              {!location && (
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  className="bg-black px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">Enable Location</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          contentContainerStyle={{ 
            paddingTop: 8,
            paddingBottom: 80,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default FeedScreen;