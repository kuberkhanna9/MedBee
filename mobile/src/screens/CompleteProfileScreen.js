import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { GEMINI_CONFIG } from '../config/api';
import { useProfile } from '../context/ProfileContext';

const CompleteProfileScreen = ({ navigation }) => {
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    bloodPressure: '',
    existingConditions: '',
    medications: '',
    allergies: '',
    lifestyle: '',
    familyHistory: '',
    customNotes: '',
  });

  const calculateBMI = () => {
    const heightInMeters = parseFloat(formData.height) / 100;
    const weightInKg = parseFloat(formData.weight);
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getHealthSummary = async () => {
    try {
      const bmi = calculateBMI();
      const prompt = `As a healthcare professional, please analyze the following patient data and provide:
1. A comprehensive health summary
2. BMI category and recommendations
3. Recommended healthy ranges for vital signs
4. Lifestyle recommendations based on their conditions
5. Key health metrics to monitor

Patient Data:
- Age: ${formData.age}
- Gender: ${formData.gender}
- BMI: ${bmi} (Weight: ${formData.weight}kg, Height: ${formData.height}cm)
- Blood Pressure: ${formData.bloodPressure}
- Existing Conditions: ${formData.existingConditions}
- Current Medications: ${formData.medications}
- Allergies: ${formData.allergies}
- Lifestyle: ${formData.lifestyle}
- Family History: ${formData.familyHistory}
- Additional Notes: ${formData.customNotes}

Please structure the response clearly with sections and bullet points.`;

      const response = await axios.post(
        `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }
      throw new Error('Failed to get a valid response');
    } catch (error) {
      console.error('Error getting health summary:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const healthSummary = await getHealthSummary();
      const profileData = {
        ...formData,
        bmi: calculateBMI(),
        healthSummary,
      };
      
      // Update the global profile context
      updateProfile(profileData);
      
      // Navigate to HealthMetrics screen
      navigation.navigate('HealthMetrics');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process your health data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text h4 style={styles.stepTitle}>Basic Information</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          keyboardType="numeric"
          placeholder="Enter your age"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          value={formData.gender}
          onChangeText={(text) => setFormData({ ...formData, gender: text })}
          placeholder="Enter your gender"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={formData.weight}
          onChangeText={(text) => setFormData({ ...formData, weight: text })}
          keyboardType="numeric"
          placeholder="Enter your weight in kilograms"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={formData.height}
          onChangeText={(text) => setFormData({ ...formData, height: text })}
          keyboardType="numeric"
          placeholder="Enter your height in centimeters"
        />
      </View>

      <Button
        title="Next"
        onPress={() => setStep(2)}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.button}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text h4 style={styles.stepTitle}>Health Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Blood Pressure (e.g., 120/80)</Text>
        <TextInput
          style={styles.input}
          value={formData.bloodPressure}
          onChangeText={(text) => setFormData({ ...formData, bloodPressure: text })}
          placeholder="Enter your blood pressure"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Existing Medical Conditions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.existingConditions}
          onChangeText={(text) => setFormData({ ...formData, existingConditions: text })}
          placeholder="List any existing medical conditions"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Medications</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.medications}
          onChangeText={(text) => setFormData({ ...formData, medications: text })}
          placeholder="List any medications you're currently taking"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep(1)}
          containerStyle={[styles.buttonContainer, styles.halfButton]}
          buttonStyle={[styles.button, styles.backButton]}
        />
        <Button
          title="Next"
          onPress={() => setStep(3)}
          containerStyle={[styles.buttonContainer, styles.halfButton]}
          buttonStyle={styles.button}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text h4 style={styles.stepTitle}>Additional Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Allergies</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.allergies}
          onChangeText={(text) => setFormData({ ...formData, allergies: text })}
          placeholder="List any allergies"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Lifestyle (Exercise, Diet, etc.)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.lifestyle}
          onChangeText={(text) => setFormData({ ...formData, lifestyle: text })}
          placeholder="Describe your lifestyle habits"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Family Medical History</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.familyHistory}
          onChangeText={(text) => setFormData({ ...formData, familyHistory: text })}
          placeholder="Describe any relevant family medical history"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.customNotes}
          onChangeText={(text) => setFormData({ ...formData, customNotes: text })}
          placeholder="Any additional health information you'd like to share"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep(2)}
          containerStyle={[styles.buttonContainer, styles.halfButton]}
          buttonStyle={[styles.button, styles.backButton]}
        />
        <Button
          title="Submit"
          onPress={handleSubmit}
          containerStyle={[styles.buttonContainer, styles.halfButton]}
          buttonStyle={styles.button}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text h3 style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us understand your health better to provide personalized recommendations
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i <= step ? styles.progressDotActive : {},
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressText}>Step {step} of 3</Text>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    color: '#27348B',
    marginBottom: 10,
  },
  subtitle: {
    color: '#6c757d',
    fontSize: 16,
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dee2e6',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#27348B',
  },
  progressText: {
    color: '#6c757d',
    fontSize: 14,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    color: '#27348B',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#27348B',
    borderRadius: 8,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  halfButton: {
    flex: 0.48,
  },
});

export default CompleteProfileScreen; 