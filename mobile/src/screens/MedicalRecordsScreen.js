import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { Text, Icon, Card, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';

const { height } = Dimensions.get('window');

const MedicalRecordsScreen = () => {
  const [records, setRecords] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [pdfToAdd, setPdfToAdd] = useState(null);
  const [descInput, setDescInput] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [pdfToView, setPdfToView] = useState(null);

  const handleAddRecord = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setPdfToAdd(file);
      setDescInput('');
      setAddModalVisible(true);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleSaveRecord = () => {
    if (!pdfToAdd) return;
    setRecords(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: pdfToAdd.name,
        uri: pdfToAdd.uri,
        date: new Date().toLocaleDateString(),
        description: descInput,
      },
    ]);
    setAddModalVisible(false);
    setPdfToAdd(null);
    setDescInput('');
  };

  const handleViewPDF = (record) => {
    setPdfToView(record);
    setViewModalVisible(true);
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2089dc' }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar backgroundColor="#2089dc" barStyle="light-content" />
        <View style={styles.headerModern}>
          <Text style={styles.headerTitleModern}>Medical Records</Text>
          <Text style={styles.headerSubtitleModern}>View and manage your medical history</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          {records.length === 0 ? (
            <Text style={styles.emptyText}>No medical records uploaded yet.</Text>
          ) : (
            records.map((record) => (
              <Card containerStyle={styles.card} key={record.id}>
                <Card.Title style={styles.cardTitle}>{record.name}</Card.Title>
                <Text style={styles.cardDate}>Added: {record.date}</Text>
                {record.description ? (
                  <Text style={styles.cardDesc}>{record.description}</Text>
                ) : null}
                <Button
                  title="View PDF"
                  icon={<Icon name="picture-as-pdf" type="material" color="#fff" size={20} containerStyle={{ marginRight: 8 }} />}
                  buttonStyle={styles.viewButton}
                  onPress={() => handleViewPDF(record)}
                />
              </Card>
            ))
          )}
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={handleAddRecord}>
          <Icon name="add" type="material" color="#fff" size={32} />
        </TouchableOpacity>
        {/* Add Description Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContent}>
              <Text style={styles.modalTitle}>Add Description</Text>
              <TextInput
                style={styles.descInput}
                placeholder="Enter a description for this record..."
                value={descInput}
                onChangeText={setDescInput}
                multiline
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button
                  title="Cancel"
                  type="outline"
                  onPress={() => setAddModalVisible(false)}
                  buttonStyle={{ marginRight: 10, borderColor: '#2089dc' }}
                  titleStyle={{ color: '#2089dc' }}
                />
                <Button
                  title="Save"
                  onPress={handleSaveRecord}
                  buttonStyle={{ backgroundColor: '#2089dc' }}
                />
              </View>
            </View>
          </View>
        </Modal>
        {/* View PDF Modal */}
        <Modal
          visible={viewModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setViewModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <View style={styles.pdfHeader}>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Icon name="close" type="material" color="#fff" size={32} />
              </TouchableOpacity>
              <Text style={styles.pdfTitle}>{pdfToView?.name}</Text>
            </View>
            {pdfToView && (
              <WebView
                source={{ uri: pdfToView.uri }}
                style={{ flex: 1, minHeight: height * 0.7 }}
                useWebKit
                originWhitelist={["*"]}
              />
            )}
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#27348B',
    marginBottom: 4,
  },
  cardDate: {
    color: '#607D8B',
    fontSize: 14,
    marginBottom: 8,
  },
  cardDesc: {
    color: '#333',
    fontSize: 15,
    marginBottom: 10,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2089dc',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2089dc',
    marginBottom: 16,
    textAlign: 'center',
  },
  descInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
  },
  viewButton: {
    backgroundColor: '#2089dc',
    borderRadius: 10,
    marginTop: 10,
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2089dc',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  pdfTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
  },
});

export default MedicalRecordsScreen; 