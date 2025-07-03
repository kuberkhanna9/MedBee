import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Icon, Card } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { GEMINI_CONFIG } from '../config/api';
import * as mime from 'react-native-mime-types';

const PdfSummaryScreen = ({ route, navigation }) => {
  const { pdfUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    processPdf();
  }, []);

  const processPdf = async () => {
    try {
      // Read the PDF file info
      const fileUri = pdfUri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileType = mime.lookup(fileUri) || 'application/pdf';

      const formData = new FormData();
      formData.append('pdf', {
        uri: fileUri,
        name: 'document.pdf',
        type: fileType,
      });

      // Replace with your backend URL
      const backendUrl = 'http://192.168.1.3:4000/extract-text';
      const response = await axios.post(backendUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extractedText = response.data.text;
      setPdfText(extractedText);

      // Send extracted text to Gemini
      const geminiResponse = await axios.post(
        `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Summarize the following content by extracting only the main points and essential information. Do NOT include any document overview, metadata, or technical details. Use proper bullet points (•) for lists, not stars (*) or dashes (-). Format the summary with clear sections, bullet points where appropriate, and highlight any important terms or numbers.\n\n${extractedText}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }
      );
      if (!geminiResponse.data.candidates || !geminiResponse.data.candidates[0]) {
        throw new Error('No response from Gemini API');
      }
      const summaryText = geminiResponse.data.candidates[0].content.parts[0].text;
      setSummary(summaryText);
      setLoading(false);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Failed to process PDF. Please try again.');
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { sender: 'user', text: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatLoading(true);
    try {
      const prompt = `You are an expert assistant. Answer the following question based ONLY on the content below. If the answer is not present, say you don't know.\n\nDocument Content:\n${pdfText}\n\nQuestion: ${chatInput}`;
      const response = await axios.post(
        `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        }
      );
      let answer = 'No answer.';
      if (response.data.candidates && response.data.candidates[0]) {
        answer = response.data.candidates[0].content.parts[0].text;
      }
      setChatHistory((prev) => [...prev, { sender: 'ai', text: answer }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Sorry, I could not process your question.' }]);
    }
    setChatInput('');
    setChatLoading(false);
  };

  const renderFormattedText = (text) => {
    // Split text into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a bullet point
      if (paragraph.trim().startsWith('•')) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bulletText}>
              {formatTextWithMarkdown(paragraph)}
            </Text>
          </View>
        );
      }
      
      // Check if paragraph contains a URL
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = paragraph.split(urlRegex);
      
      if (parts.length > 1) {
        return (
          <View key={index} style={styles.paragraph}>
            {parts.map((part, i) => {
              if (part.match(urlRegex)) {
                return (
                  <Text
                    key={i}
                    style={styles.link}
                    onPress={() => Linking.openURL(part)}
                  >
                    {part}
                  </Text>
                );
              }
              return (
                <Text key={i} style={styles.paragraphText}>
                  {formatTextWithMarkdown(part)}
                </Text>
              );
            })}
          </View>
        );
      }
      
      // Regular paragraph
      return (
        <View key={index} style={styles.paragraph}>
          <Text style={styles.paragraphText}>
            {formatTextWithMarkdown(paragraph)}
          </Text>
        </View>
      );
    });
  };

  const formatTextWithMarkdown = (text) => {
    // Handle bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is the text between **
        return (
          <Text key={index} style={[styles.paragraphText, styles.boldText]}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2089dc' }} />
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <StatusBar backgroundColor="#2089dc" barStyle="light-content" />
        <View style={styles.headerModern}>
          <Text style={styles.headerTitleModern}>Document Summary</Text>
          <Text style={styles.headerSubtitleModern}>AI-generated summary of your uploaded document</Text>
        </View>
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2089dc" />
              <Text style={styles.loadingText}>Analyzing document...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error" type="material" color="#ff4444" size={48} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <Card containerStyle={styles.summaryCard}>
              <Card.Title style={styles.cardTitle}>Summary</Card.Title>
              <View style={styles.summaryContent}>
                {renderFormattedText(summary)}
              </View>
            </Card>
          )}
          {/* Chat history */}
          {chatHistory.length > 0 && (
            <View style={styles.chatHistoryContainer}>
              {chatHistory.map((msg, idx) => (
                <View key={idx} style={msg.sender === 'user' ? styles.userMsg : styles.aiMsg}>
                  <Text style={msg.sender === 'user' ? styles.userMsgText : styles.aiMsgText}>{msg.text}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
        >
        {/* Chat input box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask a question about the document..."
            value={chatInput}
            onChangeText={setChatInput}
            editable={!chatLoading}
            onSubmitEditing={handleSendChat}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendChat}
            disabled={chatLoading || !chatInput.trim()}
          >
            {chatLoading ? (
              <ActivityIndicator size="small" color="#2089dc" />
            ) : (
              <Icon name="send" type="material" color="#2089dc" size={24} />
            )}
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2089dc',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 20,
    color: '#2089dc',
    marginBottom: 16,
  },
  summaryContent: {
    padding: 8,
  },
  paragraph: {
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  link: {
    color: '#2089dc',
    textDecorationLine: 'underline',
  },
  boldText: {
    fontWeight: 'bold',
  },
  headerModern: {
    backgroundColor: '#2089dc',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitleModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitleModern: {
    color: '#eaf0fb',
    fontSize: 15,
    textAlign: 'center',
  },
  backButtonOverlay: {
    position: 'absolute',
    left: 8,
    top: 32,
    zIndex: 2,
    padding: 4,
  },
  chatHistoryContainer: {
    marginTop: 16,
    marginBottom: 80,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  aiMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userMsgText: {
    color: '#2089dc',
    fontSize: 15,
  },
  aiMsgText: {
    color: '#388e3c',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 30,
    marginHorizontal: 10,
  },
  chatInput: {
    flex: 1,
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    fontSize: 15,
  },
  sendButton: {
    padding: 8,
  },
});

export default PdfSummaryScreen; 