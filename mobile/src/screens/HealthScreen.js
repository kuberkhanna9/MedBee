import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

const HealthScreen = ({ navigation }) => {
  const healthSections = [
    {
      title: 'Vaccination Records',
      image: require('../../assets/images/vaccine.jpeg'),
      description: 'View and manage your vaccination history',
      screen: 'VaccinationRecords',
    },
    {
      title: 'Medical Records',
      image: require('../../assets/images/medicalrecords.jpg'),
      description: 'Access your medical history and reports',
      screen: 'MedicalRecords',
    },
    {
      title: 'Medications',
      image: require('../../assets/images/medications.jpeg'),
      description: 'Track your medications and prescriptions',
      screen: 'Medications',
    },
    {
      title: 'Health Metrics',
      image: require('../../assets/images/healthmetric.jpg'),
      description: 'Monitor your vital signs and health metrics',
      screen: 'HealthMetrics',
    },
  ];

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2089dc' }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar backgroundColor="#2089dc" barStyle="light-content" />
        <View style={styles.container}>
          <View style={styles.headerModern}>
            <Text style={styles.headerTitleModern}>Health</Text>
            <Text style={styles.headerSubtitleModern}>Manage your health information</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            {healthSections.map((section, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(section.screen)}
                style={styles.featureCard}
              >
                <Image source={section.image} style={styles.featureImage} />
                <View style={styles.featureCardContent}>
                  <Text style={styles.featureCardTitle}>{section.title}</Text>
                  <Text style={styles.featureCardDesc}>{section.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerModern: {
    backgroundColor: '#2089dc',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerTitleModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 4,
  },
  headerSubtitleModern: {
    color: '#eaf0fb',
    fontSize: 15,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  featureImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    resizeMode: 'cover',
  },
  featureCardContent: {
    padding: 16,
  },
  featureCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#27348B',
    marginBottom: 4,
  },
  featureCardDesc: {
    color: '#607D8B',
    fontSize: 14,
  },
});

export default HealthScreen; 