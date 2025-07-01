import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Rides = () => {
    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-surface">
            <Text className="text-primary text-2xl font-bold justify-center items-center">Rides</Text>
        </SafeAreaView>
    )
}
export default Rides;