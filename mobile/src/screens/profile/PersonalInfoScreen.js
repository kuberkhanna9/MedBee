import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const PersonalInfoScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    bio: 'Software Developer | Tech Enthusiast',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text h4>Personal Information</Text>
          <Text style={styles.subtitle}>Update your personal details</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={editedUser.name}
            onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
            disabled={!isEditing}
            leftIcon={{ type: 'material', name: 'person', color: '#86939e' }}
          />

          <Input
            label="Email"
            value={editedUser.email}
            onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
            disabled={!isEditing}
            leftIcon={{ type: 'material', name: 'email', color: '#86939e' }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone"
            value={editedUser.phone}
            onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
            disabled={!isEditing}
            leftIcon={{ type: 'material', name: 'phone', color: '#86939e' }}
            keyboardType="phone-pad"
          />

          <Input
            label="Location"
            value={editedUser.location}
            onChangeText={(text) => setEditedUser({ ...editedUser, location: text })}
            disabled={!isEditing}
            leftIcon={{ type: 'material', name: 'location-on', color: '#86939e' }}
          />

          <Input
            label="Bio"
            value={editedUser.bio}
            onChangeText={(text) => setEditedUser({ ...editedUser, bio: text })}
            disabled={!isEditing}
            leftIcon={{ type: 'material', name: 'info', color: '#86939e' }}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <Button
                  title="Save"
                  onPress={handleSave}
                  containerStyle={[styles.button, styles.saveButton]}
                />
                <Button
                  title="Cancel"
                  type="outline"
                  onPress={handleCancel}
                  containerStyle={[styles.button, styles.cancelButton]}
                />
              </>
            ) : (
              <Button
                title="Edit Profile"
                onPress={() => setIsEditing(true)}
                containerStyle={styles.button}
              />
            )}
          </View>
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
  form: {
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 150,
    marginHorizontal: 10,
  },
  saveButton: {
    backgroundColor: '#2089dc',
  },
  cancelButton: {
    borderColor: '#2089dc',
  },
});

export default PersonalInfoScreen; 