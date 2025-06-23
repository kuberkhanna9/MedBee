import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Switch, ListItem, Icon, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const SecurityScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricAuth: false,
    emailNotifications: true,
    loginAlerts: true,
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // TODO: Implement actual password change logic
    Alert.alert('Success', 'Password changed successfully');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Security Settings</Text>
          <Text style={styles.subtitle}>Manage your account security</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          
          <ListItem containerStyle={styles.listItem}>
            <Icon name="security" type="material" color="#2089dc" />
            <ListItem.Content>
              <ListItem.Title>Two-Factor Authentication</ListItem.Title>
              <ListItem.Subtitle>Add an extra layer of security</ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings.twoFactorAuth}
              onValueChange={() => handleToggle('twoFactorAuth')}
            />
          </ListItem>

          <ListItem containerStyle={styles.listItem}>
            <Icon name="fingerprint" type="material" color="#2089dc" />
            <ListItem.Content>
              <ListItem.Title>Biometric Authentication</ListItem.Title>
              <ListItem.Subtitle>Use fingerprint or face ID</ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings.biometricAuth}
              onValueChange={() => handleToggle('biometricAuth')}
            />
          </ListItem>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <ListItem containerStyle={styles.listItem}>
            <Icon name="email" type="material" color="#2089dc" />
            <ListItem.Content>
              <ListItem.Title>Email Notifications</ListItem.Title>
              <ListItem.Subtitle>Get notified about security updates</ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggle('emailNotifications')}
            />
          </ListItem>

          <ListItem containerStyle={styles.listItem}>
            <Icon name="notifications" type="material" color="#2089dc" />
            <ListItem.Content>
              <ListItem.Title>Login Alerts</ListItem.Title>
              <ListItem.Subtitle>Get notified about new logins</ListItem.Subtitle>
            </ListItem.Content>
            <Switch
              value={settings.loginAlerts}
              onValueChange={() => handleToggle('loginAlerts')}
            />
          </ListItem>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setShowChangePassword(true)}
          >
            <Icon name="lock" type="material" color="#2089dc" />
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {showChangePassword && (
          <View style={styles.passwordModal}>
            <View style={styles.modalContent}>
              <Text h4 style={styles.modalTitle}>Change Password</Text>
              
              <Input
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                leftIcon={{ type: 'material', name: 'lock', color: '#86939e' }}
              />
              
              <Input
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon={{ type: 'material', name: 'lock-outline', color: '#86939e' }}
              />
              
              <Input
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={{ type: 'material', name: 'lock-outline', color: '#86939e' }}
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  type="outline"
                  onPress={() => setShowChangePassword(false)}
                  containerStyle={[styles.modalButton, styles.cancelButton]}
                />
                <Button
                  title="Change Password"
                  onPress={handleChangePassword}
                  containerStyle={[styles.modalButton, styles.saveButton]}
                />
              </View>
            </View>
          </View>
        )}
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
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  changePasswordText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2089dc',
  },
  passwordModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    width: '48%',
  },
  cancelButton: {
    borderColor: '#2089dc',
  },
  saveButton: {
    backgroundColor: '#2089dc',
  },
});

export default SecurityScreen; 