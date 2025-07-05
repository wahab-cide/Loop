import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore, useRideStore } from "@/store";

const FindRide = () => {
  const {
    userAddress,
    userLatitude,
    userLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  const { searchRides, isLoading } = useRideStore();
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleFindRides = async () => {
    // Validate that we have all required location data
    if (userLatitude == null || userLongitude == null || destinationLatitude == null || destinationLongitude == null) {
      Alert.alert(
        'Location Required',
        'Please select both your pickup location and destination before searching for rides.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!destinationAddress) {
      Alert.alert(
        'Destination Required',
        'Please select your destination before searching for rides.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSearchAttempted(true);

    try {
      console.log('Starting search with data:', {
        destinationAddress,
        destinationLat: destinationLatitude,
        destinationLng: destinationLongitude,
        userLat: userLatitude,
        userLng: userLongitude,
        radiusKm: 10
      });
      
      // Search for rides
      await searchRides({
        destinationAddress,
        destinationLat: destinationLatitude,
        destinationLng: destinationLongitude,
        userLat: userLatitude,
        userLng: userLongitude,
        radiusKm: 10, // 10km search radius
      });

      console.log('Search completed successfully');
      // Navigate to confirm-ride page
      router.push('/(root)/confirm-ride');
    } catch (error) {
      console.error('Search error in find-ride:', error);
      Alert.alert(
        'Search Failed',
        `Unable to search for rides. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <RideLayout title="Ride" snapPoints={["65%", "85%"]}>
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>

        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>

        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>
      
      <View className="items-center justify-center">
        <CustomButton
          title={isLoading ? "Searching..." : "Find Now"}
          onPress={handleFindRides}
          disabled={isLoading}
          className="mt-5"
        />
      </View>
    </RideLayout>
  );
};

export default FindRide;