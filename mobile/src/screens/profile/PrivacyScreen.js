import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, Switch, ListItem, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyScreen = () => {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    activityStatus: true,
    dataCollection: true,
    locationSharing: false,
    personalizedAds: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // TODO: Implement account deletion logic
            Alert.alert('Account Deleted', 'Your account has been deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const privacyGroups = [
    {
      title: 'Profile Privacy',
      items: [
        {
          key: 'profileVisibility',
          title: 'Profile Visibility',
          subtitle: 'Make your profile visible to others',
          icon: 'visibility',
        },
        {
          key: 'activityStatus',
          title: 'Activity Status',
          subtitle: 'Show when you are active',
          icon: 'access-time',
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          key: 'dataCollection',
          title: 'Data Collection',
          subtitle: 'Allow us to collect usage data',
          icon: 'data-usage',
        },
        {
          key: 'locationSharing',
          title: 'Location Sharing',
          subtitle: 'Share your location with the app',
          icon: 'location-on',
        },
        {
          key: 'personalizedAds',
          title: 'Personalized Ads',
          subtitle: 'Show personalized advertisements',
          icon: 'campaign',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Privacy Settings</Text>
          <Text style={styles.subtitle}>Manage your privacy preferences</Text>
        </View>

        {privacyGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            
            {group.items.map((item, itemIndex) => (
              <ListItem key={itemIndex} containerStyle={styles.listItem}>
                <Icon name={item.icon} type="material" color="#2089dc" />
                <ListItem.Content>
                  <ListItem.Title>{item.title}</ListItem.Title>
                  <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
                </ListItem.Content>
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                />
              </ListItem>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <ListItem containerStyle={styles.listItem}>
            <Icon name="download" type="material" color="#2089dc" />
            <ListItem.Content>
              <ListItem.Title>Download My Data</ListItem.Title>
              <ListItem.Subtitle>Get a copy of your data</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color="#86939e" />
          </ListItem>

          <ListItem containerStyle={styles.listItem}>
            <Icon name="delete" type="material" color="#ff3b30" />
            <ListItem.Content>
              <ListItem.Title style={styles.deleteText}>Delete Account</ListItem.Title>
              <ListItem.Subtitle>Permanently delete your account</ListItem.Subtitle>
            </ListItem.Content>
            <Button
              title="Delete"
              type="clear"
              titleStyle={styles.deleteButtonText}
              onPress={handleDeleteAccount}
            />
          </ListItem>
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subtitle: {
    color: '#86939e',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 15,
  },
  deleteText: {
    color: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ff3b30',
  },
});

export default PrivacyScreen; 