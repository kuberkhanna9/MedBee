import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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

  const renderHeader = () => (
    <LinearGradient
      colors={['#4A90E2', '#50C878']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back-outline"
            type="ionicon"
            color="#fff"
            size={24}
          />
        </TouchableOpacity>
        <Text h4 style={styles.headerTitle}>Personal Information</Text>
        <Text style={styles.subtitle}>Update your personal details</Text>
      </View>
    </LinearGradient>
  );

  const renderInputField = (label, value, onChangeText, icon, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        disabled={!isEditing}
        leftIcon={{
          type: 'ionicon',
          name: icon,
          color: isEditing ? '#4A90E2' : '#86939e',
          size: 20,
        }}
        labelStyle={styles.inputLabel}
        inputStyle={[
          styles.input,
          multiline && styles.multilineInput
        ]}
        inputContainerStyle={[
          styles.inputContainerStyle,
          isEditing && styles.activeInputContainer
        ]}
        keyboardType={keyboardType}
        autoCapitalize={label === 'Email' ? 'none' : 'words'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView}>
        <View style={styles.formCard}>
          {renderInputField(
            'Full Name',
            editedUser.name,
            (text) => setEditedUser({ ...editedUser, name: text }),
            'person-outline'
          )}

          {renderInputField(
            'Email',
            editedUser.email,
            (text) => setEditedUser({ ...editedUser, email: text }),
            'mail-outline',
            'email-address'
          )}

          {renderInputField(
            'Phone',
            editedUser.phone,
            (text) => setEditedUser({ ...editedUser, phone: text }),
            'call-outline',
            'phone-pad'
          )}

          {renderInputField(
            'Location',
            editedUser.location,
            (text) => setEditedUser({ ...editedUser, location: text }),
            'location-outline'
          )}

          {renderInputField(
            'Bio',
            editedUser.bio,
            (text) => setEditedUser({ ...editedUser, bio: text }),
            'information-circle-outline',
            'default',
            true
          )}

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <Button
                  title="Save Changes"
                  onPress={handleSave}
                  containerStyle={[styles.button, styles.saveButton]}
                  buttonStyle={styles.saveButtonStyle}
                  titleStyle={styles.buttonText}
                  icon={{
                    name: 'checkmark-outline',
                    type: 'ionicon',
                    size: 20,
                    color: '#fff',
                  }}
                  iconRight
                />
                <Button
                  title="Cancel"
                  type="outline"
                  onPress={handleCancel}
                  containerStyle={[styles.button, styles.cancelButton]}
                  buttonStyle={styles.cancelButtonStyle}
                  titleStyle={styles.cancelButtonText}
                />
              </>
            ) : (
              <Button
                title="Edit Profile"
                onPress={() => setIsEditing(true)}
                containerStyle={styles.button}
                buttonStyle={styles.editButtonStyle}
                titleStyle={styles.buttonText}
                icon={{
                  name: 'create-outline',
                  type: 'ionicon',
                  size: 20,
                  color: '#fff',
                }}
                iconRight
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
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  header: {
    padding: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    marginBottom: 5,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 15,
    padding: 15,
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
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    color: '#86939e',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    color: '#2c3e50',
    fontSize: 16,
    paddingLeft: 10,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputContainerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderColor: '#e1e8ee',
    backgroundColor: '#f8f9fa',
  },
  activeInputContainer: {
    borderColor: '#4A90E2',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  button: {
    marginVertical: 5,
  },
  saveButton: {
    marginBottom: 10,
  },
  saveButtonStyle: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
  },
  cancelButtonStyle: {
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
  },
  editButtonStyle: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  cancelButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalInfoScreen; 