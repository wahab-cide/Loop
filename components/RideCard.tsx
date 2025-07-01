import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const caretRight = require('../assets/icons/caret-right.png');

export interface RideCardProps {
  id: string | number;
  avatar: any;
  origin_address: string;
  destination_address: string;
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
  origin_address,
  destination_address,
  dateTime, 
  price, 
  seatsLeft = 0,
  driverName = 'Unknown Driver',
  rating = 0,
  carModel = 'Unknown Model',
  onPress
}) => {
  let router: ReturnType<typeof useRouter> | undefined;
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
      router.push(`/ride/${id}` as any);
    } else {
      console.warn('No navigation or onPress handler available');
    }
  };
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
        marginHorizontal: 16,
        marginBottom: 24,
      }}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      {/* Header with driver info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
        <Image 
          source={avatar} 
          style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 32, 
            marginRight: 16, 
            borderWidth: 2, 
            borderColor: '#E5E5E5' 
          }} 
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'black' }}>
            {driverName || 'Unknown Driver'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ color: '#FFD700', fontSize: 15, marginRight: 4 }}>★</Text>
            <Text style={{ color: '#666', fontSize: 15, fontWeight: '500' }}>
              {rating || 0}
            </Text>
            <Text style={{ color: '#999', fontSize: 15, marginHorizontal: 8 }}>•</Text>
            <Text style={{ color: '#666', fontSize: 15 }}>
              {carModel || 'Unknown Model'}
            </Text>
          </View>
        </View>
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 8, 
          borderRadius: 20, 
          backgroundColor: isFull ? '#EF4444' : 'black' 
        }}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>
            {isFull ? 'FULL' : `${seatsLeft || 0} LEFT`}
          </Text>
        </View>
      </View>

      {/* Route - Main content */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>
            {origin_address || 'Unknown'}
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black', marginHorizontal: 24 }}>→</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>
            {destination_address || 'Unknown'}
          </Text>
        </View>
        {/* Time and Price row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: '#999', 
              fontSize: 13, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 1, 
              marginBottom: 4 
            }}>
              DEPARTURE
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>
              {formattedDate}
            </Text>
          </View>
          <View style={{ 
            backgroundColor: 'black', 
            paddingHorizontal: 20, 
            paddingVertical: 6, 
            borderRadius: 20, 
            borderWidth: 1, 
            borderColor: 'rgba(0,0,0,0.1)' 
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 11, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 1 
            }}>
              PRICE
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white', textAlign: 'center' }}>
              {price || '$0'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom action area */}
      <View style={{ 
        borderTopWidth: 1, 
        borderTopColor: '#E5E5E5', 
        paddingHorizontal: 24, 
        paddingVertical: 16 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#666', fontSize: 15, fontWeight: '500' }}>
            Tap to view details & book
          </Text>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 6,
            }}
          >
            <Image
              source={caretRight}
              style={{ width: 22, height: 22, tintColor: '#fff' }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RideCard;