import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-InterBold text-black text-center">Verify Your ID To Start Posting Rides</Text>
    </SafeAreaView>
  );
} 