import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Image,
  Platform,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Text, Icon, Card, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Modal from 'react-native-modal';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { GEMINI_CONFIG, GOOGLE_MAPS_CONFIG } from '../config/api';
import { useProfile } from '../context/ProfileContext';

const { width } = Dimensions.get('window');

const TOP_BAR_HEIGHT = 60;
const SEARCH_BAR_HEIGHT = 60;

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_CONFIG.API_KEY;

const doctorCategories = [
  { 
    id: 1, 
    title: 'General Physician', 
    icon: 'medical-services',
    bgColor: '#E3F2FD',  // Light Blue
    iconColor: '#1976D2'
  },
  { 
    id: 2, 
    title: 'Skin & Hair', 
    icon: 'face',
    bgColor: '#F3E5F5',  // Light Purple
    iconColor: '#9C27B0'
  },
  { 
    id: 3, 
    title: 'Dental', 
    icon: 'clean-hands',
    bgColor: '#E8F5E9',  // Light Green
    iconColor: '#43A047'
  },
  { 
    id: 4, 
    title: 'Mental Health', 
    icon: 'psychology',
    bgColor: '#FFF3E0',  // Light Orange
    iconColor: '#EF6C00'
  },
  { 
    id: 5, 
    title: 'Eye Specialist', 
    icon: 'visibility',
    bgColor: '#E0F7FA',  // Light Cyan
    iconColor: '#00ACC1'
  },
  { 
    id: 6, 
    title: 'Heart', 
    icon: 'favorite',
    bgColor: '#FCE4EC',  // Light Pink
    iconColor: '#D81B60'
  },
  { 
    id: 7, 
    title: 'Pediatrics', 
    icon: 'child-care',
    bgColor: '#FFF8E1',  // Light Amber
    iconColor: '#FFB300'
  },
  { 
    id: 8, 
    title: 'Orthopedic', 
    icon: 'accessibility',
    bgColor: '#EFEBE9',  // Light Brown
    iconColor: '#795548'
  },
  { 
    id: 9, 
    title: 'ENT', 
    icon: 'hearing',
    bgColor: '#F1F8E9',  // Light Lime
    iconColor: '#7CB342'
  }
];

const DoctorCategoryCard = ({ category, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: category.bgColor }]}
    onPress={onPress}
  >
    <Icon
      name={category.icon}
      type="material"
      color={category.iconColor}
      size={24}
    />
    <Text style={[styles.categoryTitle, { color: category.iconColor }]}>
      {category.title}
    </Text>
  </TouchableOpacity>
);

const CompleteProfileCard = ({ onPress }) => (
  <Card containerStyle={styles.completeProfileCard}>
    <View style={styles.completeProfileContent}>
      <View style={styles.completeProfileLeft}>
        <Icon
          name="account-circle"
          type="material"
          color="#27348B"
          size={40}
        />
      </View>
      <View style={styles.completeProfileMiddle}>
        <Text style={styles.completeProfileTitle}>Complete Your Profile</Text>
        <Text style={styles.completeProfileSubtitle}>Get personalized health insights by completing your profile</Text>
      </View>
      <View style={styles.completeProfileRight}>
        <Button
          icon={
            <Icon
              name="arrow-forward"
              type="material"
              color="white"
              size={20}
            />
          }
          onPress={onPress}
          buttonStyle={styles.completeProfileButton}
        />
      </View>
    </View>
  </Card>
);

const isProfileIncomplete = (profileData) => {
  return !profileData?.bmi || 
         !profileData?.weight || 
         !profileData?.age || 
         !profileData?.bloodPressure;
};

const DashboardScreen = ({ navigation }) => {
  const { profileData } = useProfile();
  const [location, setLocation] = useState('Bangalore');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const mapRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [locationInput, setLocationInput] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      getCurrentLocation();
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarker({ latitude, longitude });
      // Reverse geocode to get city/address and update locationInput
      try {
        let [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place && place.city) {
          setLocationInput(place.city);
        } else if (place && place.name) {
          setLocationInput(place.name);
        } else {
          setLocationInput('');
        }
      } catch (e) {
        setLocationInput('');
      }
    } catch (error) {
      // fallback to default
    }
  };

  const handleLocationSelect = async (coordinate) => {
    setMarker(coordinate);
    setRegion({ ...region, ...coordinate });
    // Reverse geocode to get city name
    try {
      let [place] = await Location.reverseGeocodeAsync(coordinate);
      if (place && place.city) {
        setLocation(place.city);
      } else if (place && place.name) {
        setLocation(place.name);
      }
    } catch (e) {}
    setLocationModalVisible(false);
  };

  const handleLocationInputSubmit = async () => {
    if (!locationInput.trim()) return;
    setLocationLoading(true);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationInput)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results && response.data.results.length > 0) {
        const loc = response.data.results[0].geometry.location;
        setRegion({
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setMarker({ latitude: loc.lat, longitude: loc.lng });
        // Set location name from formatted address or input
        setLocation(response.data.results[0].address_components[0]?.long_name || locationInput);
        setLocationModalVisible(false);
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    try {
      // Pick PDF document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Navigate to summary screen with the PDF URI
      navigation.navigate('PdfSummary', { 
        pdfUri: result.assets[0].uri,
        loading: true 
      });

    } catch (error) {
      console.error('Error selecting PDF:', error);
      Alert.alert('Error', 'Failed to select PDF. Please try again.');
    }
  };


  const handleNotificationPress = () => {
    // TODO: Implement notification handling
    console.log('Notification pressed');
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Search', { searchQuery: category.title });
  };

  // Interpolate top bar and search bar positions
  const topBarTranslate = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });
  const searchBarTranslate = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Fixed Top Bar */}
      <View style={styles.topSection}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.userIconContainer} onPress={() => navigation.navigate('Profile')}>
            <Icon
              name="account-circle"
              type="material"
              color="#27348B"
              size={36}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationContainer} onPress={() => setLocationModalVisible(true)}>
            <Icon name="place" type="material" color="#fff" size={22} />
            <Text style={styles.locationText}>{location}</Text>
            <Icon name="keyboard-arrow-down" type="material" color="#fff" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationIconContainer}>
            <Icon
              name="notifications"
              type="material"
              color="#27348B"
              size={30}
            />
          </TouchableOpacity>
        </View>
        {/* Fixed Search Bar */}
        <View style={styles.searchBarContainer}>
          <TouchableOpacity 
            style={styles.searchInputContainer}
            onPress={() => navigation.navigate('Chat')}
          >
            <View style={[styles.searchInputContainer, { justifyContent: 'center' }]}>
              <Icon name="chat" type="material" color="#27348B" size={28} style={{ marginLeft: 15 , marginRight: 10}} />
              <Text style={{ fontSize: 16, color: '#333' }}>Chat with Health Assistant</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Picker Modal */}
      <Modal
        isVisible={locationModalVisible}
        onBackdropPress={() => setLocationModalVisible(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
        propagateSwipe={true}
      >
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, height: 400 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Select Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginRight: 8, fontSize: 18, height: 52 }}
                placeholder="Type a city or address"
                value={locationInput}
                onChangeText={setLocationInput}
                onSubmitEditing={handleLocationInputSubmit}
                editable={!locationLoading}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={getCurrentLocation} disabled={locationLoading} style={{ backgroundColor: '#e8f4ff', borderRadius: 12, padding: 14, marginRight: 8, justifyContent: 'center', alignItems: 'center', height: 52, width: 52 }}>
                <Icon name="my-location" type="material" color="#2089dc" size={28} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLocationInputSubmit} disabled={locationLoading} style={{ backgroundColor: '#2089dc', borderRadius: 12, padding: 14, justifyContent: 'center', alignItems: 'center', height: 52, width: 52 }}>
                <Icon name="search" type="material" color="#fff" size={28} />
              </TouchableOpacity>
            </View>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1, borderRadius: 12 }}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={e => handleLocationSelect(e.nativeEvent.coordinate)}
              showsUserLocation
            >
              <Marker
                coordinate={marker}
                draggable
                onDragEnd={e => handleLocationSelect(e.nativeEvent.coordinate)}
              />
            </MapView>
            <TouchableOpacity
              style={{ marginTop: 15, backgroundColor: '#2089dc', borderRadius: 30, padding: 15, alignItems: 'center', marginBottom: 10 }}
              onPress={() => setLocationModalVisible(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' , fontSize: 18}}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Complete Profile Card - Only show if profile is incomplete */}
        {isProfileIncomplete(profileData) && (
          <CompleteProfileCard 
            onPress={() => navigation.navigate('CompleteProfile')} 
          />
        )}

        <View style={styles.header}>
          <View style={styles.mainOptionsContainer}>
            <View style={styles.mainOptions}>
              <TouchableOpacity 
                style={styles.mainOption}
                onPress={handlePdfUpload}
              >
                <View style={[styles.mainOptionIcon, { backgroundColor: '#2089dc' }]}>
                  <Icon
                    name="upload-file"
                    type="material"
                    color="#fff"
                    size={24}
                  />
                </View>
                <Text style={styles.mainOptionText}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mainOption}>
                <View style={[styles.mainOptionIcon, { backgroundColor: '#ff4444' }]}>
                  <Icon
                    name="emergency"
                    type="material"
                    color="#fff"
                    size={24}
                  />
                </View>
                <Text style={styles.mainOptionText}>Emergency</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mainOption}>
                <View style={[styles.mainOptionIcon, { backgroundColor: '#FF9800' }]}>
                  <Icon
                    name="share"
                    type="material"
                    color="#fff"
                    size={24}
                  />
                </View>
                <Text style={styles.mainOptionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.healthInsightsContainer}>
          <Text h4 style={styles.sectionTitle}>Health Insights</Text>
          <Card containerStyle={styles.insightsCard}>
            <View style={styles.insightRow}>
              <View style={styles.insightItem}>
                <Icon
                  name="monitor-weight"
                  type="material"
                  color="#2089dc"
                  size={24}
                />
                <Text style={styles.insightValue}>{profileData?.bmi || 'N/A'}</Text>
                <Text style={styles.insightLabel}>BMI</Text>
                <Text style={styles.insightUnit}>index</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightItem}>
                <Icon
                  name="fitness-center"
                  type="material"
                  color="#4CAF50"
                  size={24}
                />
                <Text style={styles.insightValue}>{profileData?.weight || 'N/A'}</Text>
                <Text style={styles.insightLabel}>Weight</Text>
                <Text style={styles.insightUnit}>kg</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightItem}>
                <Icon
                  name="person"
                  type="material"
                  color="#27348B"
                  size={24}
                />
                <Text style={styles.insightValue}>{profileData?.age || 'N/A'}</Text>
                <Text style={styles.insightLabel}>Age</Text>
                <Text style={styles.insightUnit}>years</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightItem}>
                <Icon
                  name="favorite"
                  type="material"
                  color="#ff4444"
                  size={24}
                />
                <Text style={styles.insightValue}>{profileData?.bloodPressure || 'N/A'}</Text>
                <Text style={styles.insightLabel}>Blood Pressure</Text>
                <Text style={styles.insightUnit}>mmHg</Text>
              </View>
            </View>
            <View style={styles.insightSummary}>
              <Icon
                name="info"
                type="material"
                color="#2089dc"
                size={20}
              />
              <Text style={styles.insightSummaryText}>
                {profileData ? 'Your vitals are being monitored. Keep up the good work!' : 'Complete your profile to see your health insights.'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Doctor Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Find Doctors by Specialty</Text>
          <Text style={styles.sectionSubtitle}>Select a specialist for your health concern</Text>
          
          <View style={styles.categoriesSection}>
            <View style={styles.categoriesGrid}>
              {doctorCategories.map((category) => (
                <DoctorCategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => handleCategoryPress(category)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Feature Cards Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featureCardsCarousel}
          contentContainerStyle={{ paddingHorizontal: 18 }}
        >
          <View style={styles.featureCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }}
              style={styles.featureImage}
            />
            <View style={styles.featureCardFooter}>
              <Text style={styles.featureCardTitle}>Book In-Clinic Appointment</Text>
              <Icon name="chevron-right" type="material" color="#222" size={22} />
            </View>
          </View>
          <View style={styles.featureCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80' }}
              style={styles.featureImage}
            />
            <View style={styles.featureCardFooter}>
              <Text style={styles.featureCardTitle}>Instant Video Consultation</Text>
              <Icon name="chevron-right" type="material" color="#222" size={22} />
            </View>
          </View>
          <View style={styles.featureCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }}
              style={styles.featureImage}
            />
            <View style={styles.featureCardFooter}>
              <Text style={styles.featureCardTitle}>Book Lab Test</Text>
              <Icon name="chevron-right" type="material" color="#222" size={22} />
            </View>
          </View>
          <View style={styles.featureCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80' }}
              style={styles.featureImage}
            />
            <View style={styles.featureCardFooter}>
              <Text style={styles.featureCardTitle}>Order Medicines</Text>
              <Icon name="chevron-right" type="material" color="#222" size={22} />
            </View>
          </View>
          <View style={styles.featureCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80' }}
              style={styles.featureImage}
            />
            <View style={styles.featureCardFooter}>
              <Text style={styles.featureCardTitle}>Book Home Care</Text>
              <Icon name="chevron-right" type="material" color="#222" size={22} />
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    backgroundColor: '#27348B',
    paddingBottom: 24,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 40 : 56,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  userIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  locationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 6,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 18,
    marginTop: 18,
    paddingHorizontal: 10,
    height: SEARCH_BAR_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  mainOptionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  mainOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  mainOption: {
    alignItems: 'center',
    width: 80,
    backgroundColor: '#fff',
  },
  mainOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  mainOptionText: {
    fontSize: 11,
    color: '#2089dc',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  healthInsightsContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  insightItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2089dc',
    backgroundColor: '#fff',
  },
  insightLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    backgroundColor: '#fff',
  },
  insightUnit: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#fff',
  },
  insightSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  insightSummaryText: {
    marginLeft: 8,
    color: '#2089dc',
    fontSize: 12,
    backgroundColor: '#e8f4ff',
  },
  statsContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2089dc',
    marginTop: 5,
  },
  statLabel: {
    color: '#86939e',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  categoriesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryCard: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  featureCardsCarousel: {
    marginTop: 20,
    marginBottom: 10,
  },
  featureCard: {
    backgroundColor: '#eaf0fb',
    borderRadius: 18,
    width: 220,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  featureImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  featureCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  completeProfileCard: {
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeProfileLeft: {
    marginRight: 16,
  },
  completeProfileMiddle: {
    flex: 1,
  },
  completeProfileRight: {
    marginLeft: 8,
  },
  completeProfileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27348B',
    marginBottom: 4,
  },
  completeProfileSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  completeProfileButton: {
    backgroundColor: '#27348B',
    borderRadius: 20,
    width: 40,
    height: 40,
    padding: 0,
  },
});

export default DashboardScreen; 