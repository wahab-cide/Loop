import React from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

// Conditionally import map components only for native platforms
let MapView: any = null;
let PROVIDER_DEFAULT: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const MapViewModule = require('react-native-maps');
  MapView = MapViewModule.default;
  PROVIDER_DEFAULT = MapViewModule.PROVIDER_DEFAULT;
  PROVIDER_GOOGLE = MapViewModule.PROVIDER_GOOGLE;
}

import { useLocationStore } from "@/store";

const Map = () => {
  // Return early if on web platform
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-gray-200 items-center justify-center rounded-lg">
        <Text className="text-gray-500 text-center">
          Map is only available on mobile devices
        </Text>
      </View>
    );
  }

  const { userLongitude, userLatitude } = useLocationStore();

  // Show loading if user location is not available
  if (!userLatitude || !userLongitude) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="small" color="#000" />
        <Text className="mt-2 text-gray-500">Loading location...</Text>
      </View>
    );
  }

  // Simple region calculation for user location
  const region = {
    latitude: userLatitude,
    longitude: userLongitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Platform-specific configuration
  const mapConfig = {
    provider: Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT,
    mapType: Platform.OS === 'ios' ? 'mutedStandard' : 'standard', // Fix the main issue
  };

  return (
    <MapView
      provider={mapConfig.provider}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType={mapConfig.mapType} // Use platform-specific mapType
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle={Platform.OS === 'ios' ? 'light' : undefined} // iOS-only prop
      followsUserLocation={true}
      showsMyLocationButton={true}
      // Add these for better Android compatibility:
      loadingEnabled={true}
      loadingIndicatorColor="#666666"
      loadingBackgroundColor="#eeeeee"
    />
  );
};

export default Map;