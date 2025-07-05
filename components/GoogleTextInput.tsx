import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
  name: string;
}

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  placeholder,
  handlePress,
}: GoogleInputProps) => {
  const [searchText, setSearchText] = useState(initialLocation || "");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if API key exists
  if (!googlePlacesApiKey) {
    console.warn('Google Places API key is missing. Please check your environment variables.');
  }

  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googlePlacesApiKey}&types=address&language=en`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setPredictions(data.predictions || []);
        setShowPredictions(true);
      } else {
        console.warn('Places API error:', data.status, data.error_message);
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name&key=${googlePlacesApiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const details: PlaceDetails = data.result;
        if (details.geometry?.location && handlePress) {
          handlePress({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            address: details.formatted_address || details.name,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 200);
  };

  const handlePredictionPress = (prediction: PlacePrediction) => {
    setSearchText(prediction.description);
    setShowPredictions(false);
    setPredictions([]);
    getPlaceDetails(prediction.place_id);
  };

  const handleManualSubmit = async () => {
    if (searchText.trim() && handlePress) {
      try {
        // Use Google Geocoding API for manual text entry
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchText.trim())}&key=${googlePlacesApiKey}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          handlePress({
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            address: result.formatted_address,
          });
        } else {
          console.warn('Geocoding failed:', data.status, data.error_message);
          // Show error to user instead of using fallback coordinates
          console.error('Unable to find location for:', searchText.trim());
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderPrediction = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      className="p-3 border-b border-gray-200 bg-white"
      onPress={() => handlePredictionPress(item)}
    >
      <Text className="font-medium text-gray-900">
        {item.structured_formatting?.main_text || item.description}
      </Text>
      {item.structured_formatting?.secondary_text && (
        <Text className="text-sm text-gray-500">
          {item.structured_formatting.secondary_text}
        </Text>
      )}
    </TouchableOpacity>
  );

  // EXACT STYLING FROM GOOGLE PLACES AUTOCOMPLETE SAMPLE
  const styles = {
    textInputContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      marginHorizontal: 20,
      position: "relative",
      shadowColor: "#d4d4d4",
    },
    textInput: {
      backgroundColor: textInputBackgroundColor ? textInputBackgroundColor : "white",
      fontSize: 16,
      fontWeight: "600" as const,
      marginTop: 5,
      width: "100%" as const,
      borderRadius: 200,
      paddingVertical: 16,
      paddingLeft: 50, // Space for icon
      paddingRight: 16,
    },
    listView: {
      backgroundColor: textInputBackgroundColor ? textInputBackgroundColor : "white",
      position: "relative",
      top: 0,
      width: "100%",
      borderRadius: 10,
      shadowColor: "#d4d4d4",
      zIndex: 99,
    },
  };

  return (
    <View className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}>
      {/* Container with exact same structure as GooglePlacesAutocomplete */}
      <View style={{ width: "100%" }}>
        {/* Text Input Container */}
        <View style={styles.textInputContainer}>
          {/* Left Icon Button */}
          <View 
            className="justify-center items-center w-6 h-6"
            style={{
              position: "absolute",
              left: 15,
              zIndex: 1,
            }}
          >
            <Image
              source={icon ? icon : icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
          
          {/* Text Input */}
          <TextInput
            placeholder={initialLocation ?? placeholder ?? "Where do you want to go?"}
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={handleTextChange}
            onFocus={() => {
              if (predictions.length > 0) {
                setShowPredictions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowPredictions(false), 200);
            }}
            onSubmitEditing={handleManualSubmit}
            returnKeyType="search"
            style={styles.textInput}
          />
        </View>

        {/* Predictions List */}
        {showPredictions && predictions.length > 0 && (
          <View style={styles.listView}>
            <FlatList
              data={predictions}
              renderItem={renderPrediction}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ borderRadius: 10 }}
            />
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.listView}>
            <View className="p-3">
              <Text className="text-center text-gray-500">Searching...</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default GoogleTextInput;