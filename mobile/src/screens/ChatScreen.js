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
  StatusBar,
} from 'react-native';
import { Text, Input, Icon, Avatar } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { GEMINI_CONFIG } from '../config/api';

const ChatScreen = () => {
  const navigation = useNavigation();
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
        return 'I apologize, but I encountered an error. Please try again.';
      }
    } catch (error) {
      console.error('Error calling Gemini:', error.response?.data || error.message);
      return `Error: ${error.message || 'Unable to connect to the AI service. Please try again.'}`;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

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
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2089dc" />
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.headerModern}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon
                name="arrow-back"
                type="material"
                color="#fff"
                size={24}
              />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Health Assistant</Text>
              <Text style={styles.headerSubtitle}>Your AI health companion</Text>
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
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
              placeholder="Ask me anything about health..."
              value={inputText}
              onChangeText={setInputText}
              containerStyle={styles.input}
              inputContainerStyle={styles.inputContainerStyle}
              multiline
              maxHeight={100}
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
              <Icon
                name="send"
                type="material"
                color={!inputText.trim() || isLoading ? '#86939e' : '#fff'}
                size={24}
              />
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2089dc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerModern: {
    backgroundColor: '#2089dc',
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    backgroundColor: '#2089dc',
    marginRight: 8,
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#2089dc',
    borderTopRightRadius: 4,
  },
  messageTextContainer: {
    marginBottom: 4,
  },
  regularText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#2c3e50',
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 15,
    marginRight: 8,
    color: '#2c3e50',
  },
  bulletPointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#2c3e50',
  },
  boldText: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  botTimestamp: {
    color: '#86939e',
    textAlign: 'left',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignSelf: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#2089dc',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2089dc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e1e8ed',
  },
});

export default ChatScreen; 