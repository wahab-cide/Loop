import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { RideData, useLocationStore, useRideStore } from "@/store";

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { rides, selectedRide } = useRideStore();
  const { rideId } = useLocalSearchParams<{ rideId?: string }>();
  
  const [rideDetails, setRideDetails] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine which ride to display
  useEffect(() => {
    if (rideId) {
      // Coming from feed - need to fetch ride details
      fetchRideDetails(rideId);
    } else if (selectedRide) {
      // Coming from confirm-ride - use selected ride from store
      const storeRideDetails = rides.find(ride => ride.id === selectedRide);
      setRideDetails(storeRideDetails || null);
    }
  }, [rideId, selectedRide, rides]);

  const fetchRideDetails = async (id: string) => {
    setLoading(true);
    try {
      // Use the new ride details API endpoint
      const response = await fetch(`/(api)/rides/${id}`);

      const data = await response.json();
      if (data.success) {
        setRideDetails(data.ride);
      } else {
        console.error('Failed to fetch ride details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRideDetails = rideDetails;

  // Show loading state when fetching ride details
  if (loading) {
    return (
      <RideLayout title="Book Ride">
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-gray-600 text-center mt-4">
            Loading ride details...
          </Text>
        </View>
      </RideLayout>
    );
  }

  // If no ride is selected, show error
  if (!selectedRideDetails) {
    return (
      <RideLayout title="Book Ride">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-red-600 text-center text-lg mb-4">
            {rideId ? 'Ride not found. Please try again.' : 'No ride selected. Please go back and select a ride.'}
          </Text>
        </View>
      </RideLayout>
    );
  }

  // Helper function to get driver initials for avatar fallback
  const getDriverInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
    }
    return nameParts[0].charAt(0);
  };

  // Format departure time as number (likely timestamp or minutes)
  const getRideTimeAsNumber = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Option 1: Return timestamp
      return date.getTime();
      
      // Option 2: Return minutes from now (uncomment if preferred)
      // const now = new Date();
      // const diffMs = date.getTime() - now.getTime();
      // return Math.max(0, Math.floor(diffMs / (1000 * 60))); // minutes
    } catch (error) {
      return 0; // fallback
    }
  };

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
      <RideLayout title="Book Ride">
        <>
          <Text className="text-xl font-JakartaSemiBold mb-3">
            Ride Information
          </Text>

          <View className="flex flex-col w-full items-center justify-center mt-10">
            {/* Driver Avatar */}
            <View className="w-28 h-28 rounded-full bg-gray-300 justify-center items-center">
              {selectedRideDetails.driver.avatar_url ? (
                <Image
                  source={{ uri: selectedRideDetails.driver.avatar_url }}
                  className="w-28 h-28 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-600 font-semibold text-2xl">
                  {getDriverInitials(selectedRideDetails.driver.name)}
                </Text>
              )}
            </View>

            {/* Driver Name and Rating */}
            <View className="flex flex-row items-center justify-center mt-5 space-x-2">
              <Text className="text-lg font-JakartaSemiBold">
                {selectedRideDetails.driver.name}
              </Text>

              <View className="flex flex-row items-center space-x-0.5">
                <Image
                  source={icons.star}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-lg font-JakartaRegular">
                  {selectedRideDetails.driver.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            {/* Vehicle Info */}
            <Text className="text-gray-600 text-center mt-2">
              {selectedRideDetails.driver.vehicle.color} {selectedRideDetails.driver.vehicle.make} {selectedRideDetails.driver.vehicle.model} ({selectedRideDetails.driver.vehicle.year})
            </Text>
            <Text className="text-gray-500 text-sm">
              License: {selectedRideDetails.driver.vehicle.plate}
            </Text>
          </View>

          {/* Ride Details */}
          <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Ride Price</Text>
              <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
                ${selectedRideDetails.price.toFixed(2)}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Departure Time</Text>
              <Text className="text-lg font-JakartaRegular">
                {new Date(selectedRideDetails.departure_time).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Available Seats</Text>
              <Text className="text-lg font-JakartaRegular">
                {selectedRideDetails.seats_available} of {selectedRideDetails.seats_total}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full py-3">
              <Text className="text-lg font-JakartaRegular">Distance</Text>
              <Text className="text-lg font-JakartaRegular">
                {selectedRideDetails.distance_from_user.toFixed(1)} km away
              </Text>
            </View>
          </View>

          {/* Route Information */}
          <View className="flex flex-col w-full items-start justify-center mt-5">
            <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
              <Image source={icons.to} className="w-6 h-6" />
              <View className="ml-2 flex-1">
                <Text className="text-lg font-JakartaRegular">
                  {userAddress || selectedRideDetails.origin.label}
                </Text>
                <Text className="text-sm text-gray-500">
                  {userAddress ? 'Your pickup location' : 'Ride pickup location'}
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
              <Image source={icons.point} className="w-6 h-6" />
              <View className="ml-2 flex-1">
                <Text className="text-lg font-JakartaRegular">
                  {destinationAddress || selectedRideDetails.destination.label}
                </Text>
                <Text className="text-sm text-gray-500">Destination</Text>
              </View>
            </View>

            <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
              <Image source={icons.map} className="w-6 h-6" />
              <View className="ml-2 flex-1">
                <Text className="text-lg font-JakartaRegular">
                  {selectedRideDetails.origin.label}
                </Text>
                <Text className="text-sm text-gray-500">Driver's starting point</Text>
              </View>
            </View>
          </View>

          {/* Payment Component */}
          <View className="flex-1 justify-center items-center px-5 pt-5 pb-5">
            <Payment
              fullName={user?.fullName!}
              email={user?.emailAddresses[0].emailAddress!}
              amount={selectedRideDetails.price.toString()}
              rideId={selectedRideDetails.id} // Pass ride ID instead of driver ID
              driverId={selectedRideDetails.driver_id ? parseInt(selectedRideDetails.driver_id) : 0}
              rideTime={getRideTimeAsNumber(selectedRideDetails.departure_time)}
            />
          </View>
        </>
      </RideLayout>
    </StripeProvider>
  );
};

export default BookRide;