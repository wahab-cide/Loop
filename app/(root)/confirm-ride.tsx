import { router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import RideCard from "@/components/RideCard"; // We'll create this component
import RideLayout from "@/components/RideLayout";
import { useLocationStore, useRideStore } from "@/store";

const ConfirmRide = () => {
  const { rides, selectedRide, setSelectedRide, isLoading, error } = useRideStore();
  const { destinationAddress } = useLocationStore();

  const handleSelectRide = () => {
    if (!selectedRide) {
      // Show alert to select a ride
      return;
    }
    router.push("/(root)/book-ride");
  };

  // Loading state
  if (isLoading) {
    return (
      <RideLayout title="Finding Rides..." snapPoints={["65%", "85%"]}>
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-600 text-center">
            Searching for rides to {destinationAddress}...
          </Text>
        </View>
      </RideLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <RideLayout title="Search Error" snapPoints={["65%", "85%"]}>
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-red-600 text-center text-lg mb-4">
            {error}
          </Text>
          <CustomButton
            title="Try Again"
            onPress={() => router.back()}
            className="w-full"
          />
        </View>
      </RideLayout>
    );
  }

  // No rides found
  if (rides.length === 0) {
    return (
      <RideLayout title="No Rides Found" snapPoints={["65%", "85%"]}>
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-gray-600 text-center text-lg mb-2">
            No rides to {destinationAddress} in your area yet.
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Try adjusting your pickup location or check back later.
          </Text>
          <View className="w-full space-y-3">
            <CustomButton
              title="Search Again"
              onPress={() => router.back()}
              className="w-full"
            />
            <CustomButton
              title="Post Your Own Ride"
              onPress={() => router.push("/(feed)/post-ride")}
              className="w-full bg-gray-100"
              textVariant="primary"
            />
          </View>
        </View>
      </RideLayout>
    );
  }

  // Rides found
  return (
    <RideLayout title={`${rides.length} Rides Found`} snapPoints={["65%", "85%"]} hasScrollableContent={true}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            selected={selectedRide === item.id}
            onSelect={() => setSelectedRide(item.id)}
            variant="selection" // Use selection variant
            showDistance={true}
            showOrigin={true}
            showDestination={false} // Don't show destination in selection
          />
        )}
        ListHeaderComponent={() => (
          <Text className="text-gray-600 text-center mb-4 px-5">
            Rides to {destinationAddress}
          </Text>
        )}
        ListFooterComponent={() => (
          <View className="flex-1 justify-center items-center px-5 pt-10 pb-5">
            <CustomButton
              title="Select Ride"
              onPress={handleSelectRide}
              disabled={!selectedRide}
              className={`w-full ${!selectedRide ? 'opacity-50' : ''}`}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </RideLayout>
  );
};

export default ConfirmRide;