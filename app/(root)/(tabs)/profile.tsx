import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-surface">
            <Text className="text-primary text-2xl font-bold justify-center items-center">Profile</Text>
        </SafeAreaView>
    )
}
export default Profile;