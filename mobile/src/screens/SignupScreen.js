import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = () => {
    // TODO: Implement signup logic
    console.log('Signup pressed', { name, email, password, confirmPassword });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.headerContainer}>
            <Text h3 style={styles.headerText}>Create Account</Text>
            <Text style={styles.subHeaderText}>Sign up to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              placeholder="Full Name"
              leftIcon={<Icon name="person" type="material" size={24} color="#86939e" />}
              onChangeText={setName}
              value={name}
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="Email"
              leftIcon={<Icon name="email" type="material" size={24} color="#86939e" />}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="Password"
              leftIcon={<Icon name="lock" type="material" size={24} color="#86939e" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    type="material"
                    size={24}
                    color="#86939e"
                  />
                </TouchableOpacity>
              }
              onChangeText={setPassword}
              value={password}
              secureTextEntry={!showPassword}
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="Confirm Password"
              leftIcon={<Icon name="lock" type="material" size={24} color="#86939e" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    type="material"
                    size={24}
                    color="#86939e"
                  />
                </TouchableOpacity>
              }
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry={!showConfirmPassword}
              containerStyle={styles.inputContainer}
            />

            <Button
              title="Sign Up"
              onPress={handleSignup}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.button}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerText: {
    color: '#2089dc',
    marginBottom: 10,
  },
  subHeaderText: {
    color: '#86939e',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 25,
    paddingVertical: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#86939e',
    fontSize: 14,
  },
  loginLink: {
    color: '#2089dc',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen; 