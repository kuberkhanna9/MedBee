import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Text, ListItem, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
  });

  const [scaleValue] = useState(new Animated.Value(1));

  const handleEditProfile = () => {
    navigation.navigate('PersonalInfo');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => navigation.navigate('Login'),
          style: 'destructive',
        },
      ]
    );
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const menuItems = [
    {
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: () => navigation.navigate('PersonalInfo'),
      color: '#4A90E2',
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
      color: '#FFB347',
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help & Support', 'Get assistance'),
      color: '#9370DB',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={false}>
        <LinearGradient
          colors={['#4A90E2', '#50C878']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text h4 style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Button
              title="Edit Profile"
              type="outline"
              onPress={handleEditProfile}
              containerStyle={styles.editButton}
              buttonStyle={styles.editButtonStyle}
              titleStyle={styles.editButtonText}
              icon={{
                name: 'edit',
                type: 'material',
                size: 15,
                color: '#fff',
              }}
              iconRight
            />
          </View>
        </LinearGradient>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <ListItem containerStyle={styles.infoItem}>
              <Icon name="phone" type="material" color="#4A90E2" />
              <ListItem.Content>
                <ListItem.Title style={styles.infoTitle}>Phone</ListItem.Title>
                <ListItem.Subtitle>{user.phone}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>

            <ListItem containerStyle={[styles.infoItem, { borderBottomWidth: 0 }]}>
              <Icon name="location-on" type="material" color="#50C878" />
              <ListItem.Content>
                <ListItem.Title style={styles.infoTitle}>Location</ListItem.Title>
                <ListItem.Subtitle>{user.location}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.menuItemContainer,
                { transform: [{ scale: scaleValue }] }
              ]}
            >
              <TouchableOpacity
                onPress={item.onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.menuItemTouchable}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Icon
                    name={item.icon}
                    type="ionicon"
                    color={item.color}
                    size={24}
                  />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Icon
                  name="chevron-forward"
                  type="ionicon"
                  color="#86939e"
                  size={20}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" type="ionicon" color="#ff3b30" size={24} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  name: {
    color: '#fff',
    marginBottom: 10,
    fontWeight: '700',
    fontSize: 48,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    letterSpacing: 0.5,
  },
  email: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    fontSize: 16,
  },
  editButton: {
    width: 150,
  },
  editButtonStyle: {
    borderColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 25,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#fff',
    marginRight: 5,
  },
  infoContainer: {
    marginTop: -20,
    paddingHorizontal: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  infoTitle: {
    color: '#86939e',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  menuItemContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 10,
    marginBottom: 40,
  },
  logoutText: {
    color: '#ff3b30',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 