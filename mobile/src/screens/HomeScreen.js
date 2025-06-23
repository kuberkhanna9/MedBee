import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Text, Input, Icon, Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { GEMINI_CONFIG } from '../config/api';

const HomeScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m your health assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getChatGPTResponse = async (userInput) => {
    try {
      console.log('Sending request to Gemini...');
      const response = await axios.post(
        `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are a helpful health assistant. Provide general health advice and suggestions. Always remind users that you are not a replacement for professional medical advice. Keep responses concise and structured with bullet points when appropriate.\n\nUser: ${userInput}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }
      );

      console.log('Received response from Gemini');
      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        // Fallback response if the model response is not in the expected format
        return getFallbackResponse(userInput);
      }
    } catch (error) {
      console.error('Error calling Gemini:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        return 'Authentication error: Please check the API configuration.';
      } else if (error.response?.status === 429) {
        return 'Rate limit exceeded: Please try again in a few moments.';
      } else if (error.response?.status === 500) {
        return 'Server error: Please try again later.';
      } else {
        return `Error: ${error.message || 'Unable to connect to the AI service. Please try again.'}`;
      }
    }
  };

  
  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await getChatGPTResponse(inputText);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text) => {
    // Split text by newlines to handle bullet points
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle bullet points
      if (line.trim().startsWith('- ')) {
        return (
          <View key={lineIndex} style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletPointText}>
              {renderBoldText(line.substring(2))}
            </Text>
          </View>
        );
      }
      
      // Handle numbered points
      if (/^\d+\.\s/.test(line.trim())) {
        const number = line.match(/^\d+/)[0];
        const content = line.substring(number.length + 2);
        return (
          <View key={lineIndex} style={styles.bulletPointContainer}>
            <Text style={styles.bulletPoint}>{number}.</Text>
            <Text style={styles.bulletPointText}>
              {renderBoldText(content)}
            </Text>
          </View>
        );
      }

      // Regular text with bold support
      return (
        <Text key={lineIndex} style={styles.regularText}>
          {renderBoldText(line)}
        </Text>
      );
    });
  };

  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={styles.boldText}>
            {boldText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const renderMessage = (message, index) => {
    const isBot = message.sender === 'bot';
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isBot ? styles.botMessage : styles.userMessage,
          { opacity: fadeAnim }
        ]}
      >
        {isBot && (
          <Avatar
            rounded
            icon={{ name: 'medical-services', type: 'material' }}
            containerStyle={styles.botAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          isBot ? styles.botBubble : styles.userBubble,
        ]}>
          <View style={styles.messageTextContainer}>
            {renderMessageText(message.text)}
          </View>
          <Text style={[
            styles.timestamp,
            isBot ? styles.botTimestamp : styles.userTimestamp
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[styles.header, { opacity: fadeAnim }]}
      >
        <Text h4>Health Assistant</Text>
        <Text style={styles.subtitle}>Your AI health companion</Text>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2089dc" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        <Animated.View
          style={[styles.inputContainer, { opacity: fadeAnim }]}
        >
          <Input
            placeholder="Describe your symptoms..."
            value={inputText}
            onChangeText={setInputText}
            containerStyle={styles.input}
            inputContainerStyle={styles.inputContainerStyle}
            multiline
            disabled={isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#86939e" />
            ) : (
              <Icon
                name="send"
                type="material"
                color={inputText.trim() ? '#2089dc' : '#86939e'}
                size={24}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Sky blue background
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
    backgroundColor: '#64B5F6', // Changed to match the theme
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subtitle: {
    color: '#FFFFFF', // Changed to white for better contrast
    marginTop: 5,
    fontSize: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    backgroundColor: '#FFFFFF', // Changed to white
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  userBubble: {
    backgroundColor: '#64B5F6',
    borderBottomRightRadius: 5,
  },
  messageTextContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  regularText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C3E50',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 20,
    color: '#2C3E50',
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingRight: 10,
  },
  bulletPoint: {
    fontSize: 14,
    marginRight: 8,
    color: '#2C3E50',
  },
  bulletPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  botTimestamp: {
    color: '#90CAF9',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#BBDEFB',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#64B5F6',
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#BBDEFB',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#64B5F6',
    fontSize: 14,
  },
});

export default HomeScreen; 