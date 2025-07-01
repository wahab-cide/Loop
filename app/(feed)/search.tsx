import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-InterBold text-black text-center">Enter Your Destination To Find Nearby Rides</Text>
    </SafeAreaView>
  );
} 