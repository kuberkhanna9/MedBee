import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { ProfileProvider } from './src/context/ProfileContext';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import HealthScreen from './src/screens/HealthScreen';
import VaccinationRecordsScreen from './src/screens/VaccinationRecordsScreen';
import PersonalInfoScreen from './src/screens/profile/PersonalInfoScreen';
import SecurityScreen from './src/screens/profile/SecurityScreen';
import NotificationsScreen from './src/screens/profile/NotificationsScreen';
import PrivacyScreen from './src/screens/profile/PrivacyScreen';
import PdfSummaryScreen from './src/screens/PdfSummaryScreen';
import MedicalRecordsScreen from './src/screens/MedicalRecordsScreen';
import MedicationsScreen from './src/screens/MedicationsScreen';
import HealthMetricsScreen from './src/screens/HealthMetricsScreen';
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Health') {
            iconName = 'favorite';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} type="material" size={24} color={color} />;
        },
        tabBarActiveTintColor: '#2089dc',
        tabBarInactiveTintColor: 'rgba(134, 147, 158, 0.7)',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          marginHorizontal: 35,
          borderTopWidth: 0,
          bottom: 40,
          left: 50,
          right: 50,
          height: 65,
          borderRadius: 35,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 12,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        },
        tabBarItemStyle: {
          padding: 4,
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search'
        }}
      />
      <Tab.Screen 
        name="Health" 
        component={HealthScreen}
        options={{
          tabBarLabel: 'Health'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen 
              name="CompleteProfile" 
              component={CompleteProfileScreen}
              options={{
                headerShown: true,
                title: 'Complete Your Profile',
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                headerShown: false,
                title: 'Health Assistant',
              }}
            />
            <Stack.Screen 
              name="PersonalInfo" 
              component={PersonalInfoScreen}
              options={{
                headerShown: true,
                title: 'Personal Information',
              }}
            />
            <Stack.Screen 
              name="Security" 
              component={SecurityScreen}
              options={{
                headerShown: true,
                title: 'Security Settings',
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notification Settings',
              }}
            />
            <Stack.Screen 
              name="Privacy" 
              component={PrivacyScreen}
              options={{
                headerShown: true,
                title: 'Privacy Settings',
              }}
            />
            <Stack.Screen 
              name="VaccinationRecords" 
              component={VaccinationRecordsScreen}
              options={{
                headerShown: false,
                title: 'Vaccination Records',
              }}
            />
            <Stack.Screen 
              name="PdfSummary" 
              component={PdfSummaryScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
            name="MedicalRecords" 
            component={MedicalRecordsScreen} 
            options={{ headerShown: false }}
            />
            <Stack.Screen name="Medications" component={MedicationsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HealthMetrics" component={HealthMetricsScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
