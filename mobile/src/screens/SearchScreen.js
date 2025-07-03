import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Text, Icon, ListItem, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

import { GOOGLE_MAPS_CONFIG } from '../config/api';

import { GOOGLE_MAPS_API_KEY } from '../config/keys';


const SearchScreen = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const [region, setRegion] = useState({
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (route.params?.searchQuery) {
      handleSearch(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby doctors.');
        return;
      }
      getCurrentLocation();
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      searchNearbyDoctors(latitude, longitude);
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your location. Please check your location settings.');
    }
  };

  const searchNearbyDoctors = async (latitude, longitude) => {
    try {
      setLoading(true);
      const response = await axios.get(

        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=doctor&keyword=doctor&key=${GOOGLE_MAPS_CONFIG.API_KEY}`

        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=doctor&keyword=doctor&key=${GOOGLE_MAPS_API_KEY}`

      );

      if (response.data.results) {
        const formattedDoctors = response.data.results.map((place, index) => ({
          id: place.place_id,
          name: place.name,
          specialty: place.types.includes('doctor') ? 'General Physician' : 'Healthcare Provider',
          rating: place.rating || 0,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          address: place.vicinity,
          photos: place.photos,
          openNow: place.opening_hours?.open_now,
        }));
        setDoctors(formattedDoctors);
      }
    } catch (error) {
      console.log('Error searching doctors:', error);
      Alert.alert('Error', 'Unable to search for doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        setLoading(true);
        const response = await axios.get(

          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${text}+doctor&location=${region.latitude},${region.longitude}&radius=5000&key=${GOOGLE_MAPS_CONFIG.API_KEY}`

          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${text}+doctor&location=${region.latitude},${region.longitude}&radius=5000&key=${GOOGLE_MAPS_API_KEY}`

        );

        if (response.data.results) {
          const formattedDoctors = response.data.results.map((place) => ({
            id: place.place_id,
            name: place.name,
            specialty: place.types.includes('doctor') ? 'General Physician' : 'Healthcare Provider',
            rating: place.rating || 0,
            location: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            },
            address: place.formatted_address,
            photos: place.photos,
            openNow: place.opening_hours?.open_now,
          }));
          setDoctors(formattedDoctors);
        }
      } catch (error) {
        console.log('Error searching:', error);
        Alert.alert('Error', 'Unable to perform search. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDoctorPress = (doctor) => {
    setSelectedDoctor(doctor);
    mapRef.current?.animateToRegion({
      latitude: doctor.location.latitude,
      longitude: doctor.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleCallDoctor = (phoneNumber) => {
    Alert.alert('Call Doctor', 'This feature will be implemented soon.');
  };

  const renderDoctorItem = (doctor, index) => (
    <TouchableOpacity
      key={`doctor-${doctor.id}-${index}`}
      onPress={() => handleDoctorPress(doctor)}
    >
      <ListItem containerStyle={styles.doctorItem}>
        <Icon name="person" type="material" color="#2089dc" />
        <ListItem.Content>
          <ListItem.Title style={styles.doctorName}>
            {doctor.name}
          </ListItem.Title>
          <ListItem.Subtitle style={styles.doctorSpecialty}>
            {doctor.specialty}
          </ListItem.Subtitle>
          <Text style={styles.address}>{doctor.address}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material" color="#FFD700" size={16} />
            <Text style={styles.rating}>{doctor.rating}</Text>
            {doctor.openNow !== undefined && (
              <Text style={[styles.openStatus, { color: doctor.openNow ? '#4CAF50' : '#F44336' }]}>
                {doctor.openNow ? 'Open Now' : 'Closed'}
              </Text>
            )}
          </View>
        </ListItem.Content>
        <Button
          icon={<Icon name="phone" type="material" color="#2089dc" />}
          type="clear"
          onPress={() => handleCallDoctor(doctor.phone)}
        />
      </ListItem>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Modern Blue Header */}
        <View style={styles.headerModern}>
          <Text style={styles.headerTitleModern}>Find Doctors</Text>
          <Text style={styles.headerSubtitleModern}>Search for healthcare providers near you</Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" type="material" color="#86939e" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, specialties, or locations"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
            <Icon name="my-location" type="material" color="#2089dc" />
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {doctors.map((doctor, index) => (
              <Marker
                key={`marker-${doctor.id || index}`}
                identifier={`marker-${doctor.id || index}`}
                coordinate={doctor.location}
                title={doctor.name}
                description={doctor.specialty}
                onPress={() => handleDoctorPress(doctor)}
              >
                <Icon 
                  name="local-hospital" 
                  type="material" 
                  color="#2089dc" 
                  size={24} 
                />
              </Marker>
            ))}
          </MapView>
        </View>

        <ScrollView 
          style={styles.doctorsList}
          contentContainerStyle={styles.doctorsListContent}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === 'android'}
          keyboardDismissMode="on-drag"
        >
          {doctors.map((doctor, index) => renderDoctorItem(doctor, index))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2089dc',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerModern: {
    backgroundColor: '#2089dc',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitleModern: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitleModern: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  locationButton: {
    padding: 4,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  doctorsList: {
    flex: 1,
  },
  doctorsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  doctorItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  address: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    marginLeft: 4,
    marginRight: 8,
    color: '#2c3e50',
  },
  openStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchScreen; 