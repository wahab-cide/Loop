import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export interface RideCardProps {
  id: string | number;
  avatar: any;
  route: string;
  dateTime: string;
  price: string;
  seatsLeft: number;
  driverName?: string;
  rating?: number;
  carModel?: string;
  onPress?: () => void;
}

const RideCard: React.FC<RideCardProps> = ({ 
  id, 
  avatar, 
  route, 
  dateTime, 
  price, 
  seatsLeft,
  driverName,
  rating,
  carModel,
  onPress
}) => {
  let router;
  try {
    router = useRouter();
  } catch (error) {
    console.warn('Navigation context not available');
  }
  
  const isFull = seatsLeft === 0;
  
  const formattedDate = new Date(dateTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router) {
      router.push({ pathname: `/ride/${id}` });
    } else {
      console.warn('No navigation or onPress handler available');
    }
  };
  
  return (
    <TouchableOpacity
      className="bg-white rounded-3xl mx-4 mb-6 shadow-lg"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      {/* Header with driver info */}
      <View className="flex-row items-center p-6 pb-4">
        <Image source={avatar} className="w-16 h-16 rounded-full mr-4" />
        <View className="flex-1">
          <Text className="font-InterBold text-[18px] text-black">{driverName}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-[#FFD700] text-[14px] mr-1">★</Text>
            <Text className="text-[#666] text-[14px] font-InterMedium">{rating}</Text>
            <Text className="text-[#666] text-[14px] mx-2">•</Text>
            <Text className="text-[#666] text-[14px]">{carModel}</Text>
          </View>
        </View>
        <View className={`px-4 py-2 rounded-full ${isFull ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}>
          <Text className="text-white text-[13px] font-InterBold">
            {isFull ? 'FULL' : `${seatsLeft} LEFT`}
          </Text>
        </View>
      </View>

      {/* Route - Main content */}
      <View className="px-6 pb-4">
        <View className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-2xl p-5 mb-4">
          <Text className="font-InterBold text-[24px] text-white text-center leading-tight">
            {route}
          </Text>
        </View>
        
        {/* Time and Price row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[#888] text-[13px] font-InterMedium uppercase tracking-wide mb-1">
              DEPARTURE
            </Text>
            <Text className="font-InterBold text-[18px] text-black">
              {formattedDate}
            </Text>
          </View>
          
          <View className="bg-[#F0F9FF] px-6 py-3 rounded-2xl border border-[#0070F3]/20">
            <Text className="text-[#0070F3] text-[12px] font-InterMedium uppercase tracking-wide">
              PRICE
            </Text>
            <Text className="font-InterBold text-[24px] text-[#0070F3] text-center">
              {price}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom action area */}
      <View className="border-t border-[#F0F0F0] px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#666] text-[14px] font-InterMedium">
            Tap to view details & book
          </Text>
          <View className="bg-[#FF6B6B] w-8 h-8 rounded-full items-center justify-center">
            <Text className="text-white font-InterBold text-[16px]">→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RideCard;