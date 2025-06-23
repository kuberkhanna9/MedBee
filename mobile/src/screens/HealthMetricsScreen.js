import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Text, Card, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';

const HealthMetricsScreen = ({ navigation }) => {
  const { profileData } = useProfile();

  const renderMetricCard = (title, value, icon, color, subtitle = '') => (
    <Card containerStyle={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon name={icon} type="material" color={color} size={28} />
        <View style={styles.metricTitleContainer}>
          <Text style={styles.metricTitle}>{title}</Text>
          {subtitle ? <Text style={styles.metricSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </Card>
  );

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2089dc' }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar backgroundColor="#2089dc" barStyle="light-content" />
        <View style={styles.headerModern}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('MainApp', { screen: 'Health' })}
          >
            <View style={styles.backButtonInner}>
              <Icon
                name="keyboard-arrow-left"
                type="material"
                color="#fff"
                size={28}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitleModern}>Health Metrics</Text>
            <Text style={styles.headerSubtitleModern}>Your personal health dashboard</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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

          <Card containerStyle={styles.summaryCard}>
            <View style={styles.cardHeaderContainer}>
              <Icon name="assessment" type="material" color="#27348B" size={24} />
              <Text style={styles.cardTitle}>Health Summary</Text>
            </View>
            <Card.Divider />
            <Text style={styles.summaryText}>{profileData?.healthSummary || 'Complete your profile to see your health summary.'}</Text>
          </Card>

          <Card containerStyle={styles.summaryCard}>
            <View style={styles.cardHeaderContainer}>
              <Icon name="medical-services" type="material" color="#27348B" size={24} />
              <Text style={styles.cardTitle}>Medical Conditions</Text>
            </View>
            <Card.Divider />
            <Text style={styles.conditionsText}>{profileData?.existingConditions || 'No conditions reported'}</Text>
          </Card>

          <Card containerStyle={styles.summaryCard}>
            <View style={styles.cardHeaderContainer}>
              <Icon name="medication" type="material" color="#27348B" size={24} />
              <Text style={styles.cardTitle}>Current Medications</Text>
            </View>
            <Card.Divider />
            <Text style={styles.medicationsText}>{profileData?.medications || 'No medications reported'}</Text>
          </Card>

          <Card containerStyle={styles.summaryCard}>
            <View style={styles.cardHeaderContainer}>
              <Icon name="directions-run" type="material" color="#27348B" size={24} />
              <Text style={styles.cardTitle}>Lifestyle</Text>
            </View>
            <Card.Divider />
            <Text style={styles.lifestyleText}>{profileData?.lifestyle || 'No lifestyle information provided'}</Text>
          </Card>

          {!profileData && (
            <TouchableOpacity
              style={styles.completeProfileButton}
              onPress={() => navigation.navigate('CompleteProfile')}
            >
              <Icon name="person-add" type="material" color="#fff" size={24} style={styles.buttonIcon} />
              <Text style={styles.completeProfileButtonText}>Complete Your Profile</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerModern: {
    backgroundColor: '#2089dc',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
    zIndex: 1,
  },
  backButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  headerTitleModern: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitleModern: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#27348B',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '47%',
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27348B',
    marginLeft: 12,
  },
  summaryCard: {
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 0,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  conditionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  medicationsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  lifestyleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
  },
  completeProfileButton: {
    backgroundColor: '#27348B',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  completeProfileButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
  insightsCard: {
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 0,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  insightItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  insightDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
    textAlign: 'center',
  },
  insightUnit: {
    fontSize: 10,
    color: '#95a5a6',
  },
  insightSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  insightSummaryText: {
    marginLeft: 8,
    flex: 1,
    color: '#2c3e50',
    fontSize: 14,
  },
});

export default HealthMetricsScreen; 