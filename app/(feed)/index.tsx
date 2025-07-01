import { SignOutButton } from '@/components/SignOutButton';
import { icons } from '@/constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RideCard from '../../components/RideCard';
import { rides } from './rides';

const chips = [
  { label: 'All' },
  { label: 'Today' },
  { label: 'Weekend' },
  { label: 'Morning' },
  { label: 'Evening' },
];

const FeedScreen = () => {
  const [activeChip, setActiveChip] = useState('All');
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* TopBar */}
      <View className="flex-row items-center justify-between px-4 h-[56px]">
        {/* Left: SignOut and Logo */}
        <View className="flex-row items-center">
          <SignOutButton>
            <Image source={icons.signOut} className="w-7 h-7 mr-3" />
          </SignOutButton>
          <View className="w-8 h-8 rounded-full bg-black items-center justify-center">
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
        </View>
        <View className="flex-row items-center space-x-2">
          {/* Search Button */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-[#F2F2F2] items-center justify-center mr-2"
            onPress={() => router.push({ pathname: '/search' })}
            activeOpacity={0.8}
          >
            <Image source={icons.search} className="w-6 h-6" style={{ tintColor: '#000' }} />
          </TouchableOpacity>
          {/* Post Button */}
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-black items-center justify-center"
            onPress={() => router.push({ pathname: '/post' })}
            activeOpacity={0.8}
          >
            <Image source={icons.plus} className="w-6 h-6" style={{ tintColor: '#fff' }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip.label}
            className={`h-8 px-4 rounded-full border ${activeChip === chip.label ? 'bg-[#0A84FF] border-[#0A84FF]' : 'bg-[#EFEFEF] border-[#DDD]'} justify-center items-center`}
            onPress={() => setActiveChip(chip.label)}
            activeOpacity={0.8}
          >
            <Text className={`text-[12px] ${activeChip === chip.label ? 'text-white' : 'text-[#666]'}`}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ride Feed */}
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RideCard {...item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default FeedScreen; 