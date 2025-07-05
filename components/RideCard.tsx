// File: components/RideCard.tsx
import { icons } from "@/constants";
import { RideData } from "@/store";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface RideCardProps {
  ride: RideData;
  selected?: boolean; // Make optional for home feed
  onSelect?: () => void; // Make optional for different handlers
  onPress?: (rideId: string) => void; // New prop for home feed navigation
  variant?: 'selection' | 'feed'; // New prop to determine layout
  showDistance?: boolean; // Control distance display
  showOrigin?: boolean; // Control origin display
  showDestination?: boolean; // Control destination display
}

const RideCard = ({ 
  ride, 
  selected = false, 
  onSelect, 
  onPress,
  variant = 'selection',
  showDistance = true,
  showOrigin = true,
  showDestination = false
}: RideCardProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Helper function to get driver initials from name
  const getDriverInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
    }
    return nameParts[0].charAt(0);
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'text-green-600';
    if (ratio > 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePress = () => {
    if (variant === 'selection' && onSelect) {
      onSelect();
    } else if (variant === 'feed' && onPress) {
      onPress(ride.id);
    }
  };

  // Feed variant (for home screen)
  if (variant === 'feed') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="bg-white rounded-xl p-4 mb-4 mx-4 shadow-sm border border-gray-100"
      >
        {/* Header with Time and Distance */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              {formatDate(ride.departure_time)}
            </Text>
            <Text className="text-sm text-gray-500">
              Departs at {formatTime(ride.departure_time)}
            </Text>
          </View>
          
          {showDistance && ride.distance_from_user && (
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-blue-600">
                {ride.distance_from_user.toFixed(1)} km away
              </Text>
            </View>
          )}
        </View>

        {/* Route Information */}
        {(showOrigin || showDestination) && (
          <View className="mb-4">
            {showOrigin && (
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                <Text className="text-sm font-medium text-gray-800 flex-1" numberOfLines={1}>
                  {ride.origin.label}
                </Text>
              </View>
            )}
            
            {showOrigin && showDestination && (
              <View className="ml-1.5 w-0.5 h-4 bg-gray-300 mb-2" />
            )}
            
            {showDestination && (
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-red-500 rounded-full mr-3" />
                <Text className="text-sm font-medium text-gray-800 flex-1" numberOfLines={1}>
                  {ride.destination.label}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Driver Information */}
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center mr-3">
            {ride.driver.avatar_url ? (
              <Image
                source={{ uri: ride.driver.avatar_url }}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-600 font-semibold text-sm">
                {getDriverInitials(ride.driver.name)}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-800">
              {ride.driver.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Image source={icons.star} className="w-3 h-3 mr-1" tintColor="#FFA500" />
              <Text className="text-xs text-gray-600 mr-2">
                {ride.driver.rating.toFixed(1)}
              </Text>
              <Text className="text-xs text-gray-500">
                {ride.driver.vehicle.year} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 mt-0.5">
              {ride.driver.vehicle.color}
            </Text>
          </View>
        </View>

        {/* Bottom Row: Price and Availability */}
        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Image source={icons.point} className="w-4 h-4 mr-2" tintColor="#666" />
            <Text className={`text-sm font-medium ${getAvailabilityColor(ride.seats_available, ride.seats_total)}`}>
              {ride.seats_available} of {ride.seats_total} seats
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="text-lg font-bold text-green-600">
              ${ride.price.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-500">per seat</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Selection variant (original layout for confirm-ride screen)
  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center justify-between py-5 px-3 rounded-xl m-2 ${
        selected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200'
      }`}
    >
      {/* Driver Info */}
      <View className="flex-row items-center flex-1">
        <View className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mr-4">
          {ride.driver.avatar_url ? (
            <Image
              source={{ uri: ride.driver.avatar_url }}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-gray-600 font-semibold text-lg">
              {getDriverInitials(ride.driver.name)}
            </Text>
          )}
        </View>

        <View className="flex-1">
          {/* Driver Name */}
          <Text className="font-semibold text-lg text-gray-900">
            {ride.driver.name}
          </Text>
          
          {/* Driver Rating */}
          <View className="flex-row items-center">
            <Image source={icons.star} className="w-4 h-4 mr-1" tintColor="#FFA500" />
            <Text className="text-gray-600 text-sm">
              {ride.driver.rating.toFixed(1)}
            </Text>
          </View>
          
          {/* Vehicle Info */}
          <Text className="text-gray-600 text-sm">
            {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
          </Text>
          
          {/* Time and Distance */}
          <View className="flex-row items-center mt-1">
            <Image source={icons.clock} className="w-4 h-4 mr-1" tintColor="#666" />
            <Text className="text-gray-600 text-sm mr-3">
              {formatDate(ride.departure_time)} at {formatTime(ride.departure_time)}
            </Text>
            {showDistance && ride.distance_from_user && (
              <>
                <Image source={icons.point} className="w-4 h-4 mr-1" tintColor="#666" />
                <Text className="text-gray-600 text-sm">
                  {ride.distance_from_user.toFixed(1)}km away
                </Text>
              </>
            )}
          </View>

          {/* Origin */}
          {showOrigin && (
            <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
              From: {ride.origin.label}
            </Text>
          )}
        </View>
      </View>

      {/* Price and Seats */}
      <View className="items-end ml-2">
        <Text className="font-bold text-xl text-green-600">
          ${ride.price.toFixed(2)}
        </Text>
        <Text className="text-gray-600 text-sm">
          {ride.seats_available} of {ride.seats_total} seats
        </Text>
        {selected && (
          <View className="mt-2">
            <Image source={icons.check} className="w-5 h-5" tintColor="#3B82F6" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RideCard;