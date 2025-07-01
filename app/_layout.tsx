import { tokenCache } from "@/lib/auth";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from "react-native";
import 'react-native-reanimated';
//import AnimatedSplash from '../components/AnimatedSplash';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

LogBox.ignoreLogs(["Clerk:"]);


export default function RootLayout() {
  const [loaded] = useFonts({
    "InterBold": require("../assets/fonts/Inter-Bold.ttf"),
    "InterExtraBold": require("../assets/fonts/Inter-ExtraBold.ttf"),
    "InterExtraLight": require("../assets/fonts/Inter-ExtraLight.ttf"),
    "InterLight": require("../assets/fonts/Inter-Light.ttf"),
    "InterMedium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter": require("../assets/fonts/Inter-Regular.ttf"),
    "InterSemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(root)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
