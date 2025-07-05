import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { icons } from "@/constants";

// Conditionally import Map only for native platforms
let Map: any = null;
if (Platform.OS !== 'web') {
  Map = require("@/components/Map").default;
}

const RideLayout = ({
  title,
  snapPoints,
  children,
  hasScrollableContent = false,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
  hasScrollableContent?: boolean;
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">
              {title || "Go Back"}
            </Text>
          </View>

          {Platform.OS === 'web' ? (
            <View className="flex-1 bg-gray-200 items-center justify-center">
              <Text className="text-gray-500 text-center">
                Map is only available on mobile devices
              </Text>
            </View>
          ) : (
            <Map />
          )}
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["65%", "85%"]}
          index={0}
        >
          {title === "Choose a Rider" || hasScrollableContent ? (
            <BottomSheetView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;