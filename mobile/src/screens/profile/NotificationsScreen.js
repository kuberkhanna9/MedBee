import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Text, Switch, ListItem, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreen = () => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    activityUpdates: true,
    newFeatures: true,
    systemUpdates: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationGroups = [
    {
      title: 'General',
      items: [
        {
          key: 'pushNotifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: 'notifications',
        },
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          icon: 'email',
        },
      ],
    },
    {
      title: 'Updates',
      items: [
        {
          key: 'activityUpdates',
          title: 'Activity Updates',
          subtitle: 'Get notified about your account activity',
          icon: 'update',
        },
        {
          key: 'newFeatures',
          title: 'New Features',
          subtitle: 'Learn about new features and updates',
          icon: 'new-releases',
        },
        {
          key: 'systemUpdates',
          title: 'System Updates',
          subtitle: 'Important system notifications',
          icon: 'system-update',
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          key: 'marketingEmails',
          title: 'Marketing Emails',
          subtitle: 'Receive promotional content',
          icon: 'campaign',
        },
        {
          key: 'securityAlerts',
          title: 'Security Alerts',
          subtitle: 'Important security notifications',
          icon: 'security',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Notification Settings</Text>
          <Text style={styles.subtitle}>Manage your notification preferences</Text>
        </View>

        {notificationGroups.map((group, groupIndex) => (
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
});

export default NotificationsScreen; 