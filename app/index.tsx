import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Page = () => {
    const { isSignedIn } = useAuth()

    if (isSignedIn) { return <Redirect href={'/(root)/(tabs)/home'} />}

    
    return  <Redirect href='/(root)/(auth)/welcome'/>;
    
};
export default Page;