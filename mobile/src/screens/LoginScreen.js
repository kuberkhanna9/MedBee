import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: Implement actual login logic
    console.log('Login pressed', { email, password });
    navigation.navigate('MainApp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/medique.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text h4 style={styles.headerText}>Welcome Back!</Text>
          
          </View>

          <View style={styles.formContainer}>
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

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.button}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
      marginBottom: 20,
    },
    logo: {
      width: 750,
      height: 300,
      marginBottom: -120,  // Negative margin to pull the text up
      marginRight: 20,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#2089dc',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 10,
    width: '50%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 25,
    paddingVertical: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#86939e',
    fontSize: 14,
  },
  signupLink: {
    color: '#2089dc',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 