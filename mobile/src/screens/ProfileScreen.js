import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Avatar, ListItem, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    bio: 'Software Developer | Tech Enthusiast',
  });

  const handleEditProfile = () => {
    // TODO: Implement edit profile navigation
    Alert.alert('Edit Profile', 'Edit profile functionality will be implemented here');
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

  const menuItems = [
    {
      title: 'Personal Information',
      icon: 'person',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      title: 'Security',
      icon: 'security',
      onPress: () => navigation.navigate('Security'),
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      title: 'Privacy',
      icon: 'privacy-tip',
      onPress: () => navigation.navigate('Privacy'),
    },
    {
      title: 'Help & Support',
      icon: 'help',
      onPress: () => Alert.alert('Help & Support', 'Get assistance'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Avatar
            size="large"
            rounded
            icon={{ name: 'person', type: 'material' }}
            containerStyle={styles.avatar}
          />
          <Text h4 style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Button
            title="Edit Profile"
            type="outline"
            onPress={handleEditProfile}
            containerStyle={styles.editButton}
            buttonStyle={styles.editButtonStyle}
          />
        </View>

        <View style={styles.infoContainer}>
          <ListItem containerStyle={styles.infoItem}>
            <Icon name="phone" type="material" color="#86939e" />
            <ListItem.Content>
              <ListItem.Title style={styles.infoTitle}>Phone</ListItem.Title>
              <ListItem.Subtitle>{user.phone}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>

          <ListItem containerStyle={styles.infoItem}>
            <Icon name="location-on" type="material" color="#86939e" />
            <ListItem.Content>
              <ListItem.Title style={styles.infoTitle}>Location</ListItem.Title>
              <ListItem.Subtitle>{user.location}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>

          <ListItem containerStyle={styles.infoItem}>
            <Icon name="info" type="material" color="#86939e" />
            <ListItem.Content>
              <ListItem.Title style={styles.infoTitle}>Bio</ListItem.Title>
              <ListItem.Subtitle>{user.bio}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              containerStyle={styles.menuItem}
              onPress={item.onPress}
            >
              <Icon name={item.icon} type="material" color="#2089dc" />
              <ListItem.Content>
                <ListItem.Title style={styles.menuTitle}>{item.title}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron color="#86939e" />
            </ListItem>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" type="material" color="#ff3b30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    backgroundColor: '#2089dc',
    marginBottom: 10,
  },
  name: {
    marginBottom: 5,
  },
  email: {
    color: '#86939e',
    marginBottom: 15,
  },
  editButton: {
    width: 150,
  },
  editButtonStyle: {
    borderColor: '#2089dc',
  },
  infoContainer: {
    marginTop: 20,
  },
  infoItem: {
    paddingVertical: 15,
  },
  infoTitle: {
    color: '#86939e',
    fontSize: 12,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuTitle: {
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: '#ff3b30',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default ProfileScreen; 