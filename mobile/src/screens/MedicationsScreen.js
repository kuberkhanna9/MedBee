import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, Icon, Card, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { GEMINI_CONFIG } from '../config/api';

const MedicationsScreen = () => {
  const [folders, setFolders] = useState([
    { name: 'Diabetes', medications: [] },
    { name: 'Hypertension', medications: [] },
  ]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newMeds, setNewMeds] = useState([
    { name: '', dosage: '', instructions: '' }
  ]);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);

  const handleOpenFolder = (folderName) => {
    setSelectedFolder(folderName);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  const handleAddMedication = () => {
    setAddModalVisible(true);
    setNewMeds([{ name: '', dosage: '', instructions: '' }]);
  };

  const handleSaveMedication = () => {
    const validMeds = newMeds.filter(med => med.name.trim());
    if (validMeds.length === 0) return;
    setFolders(folders => folders.map(folder =>
      folder.name === selectedFolder
        ? { ...folder, medications: [...folder.medications, ...validMeds.map(med => ({ ...med, id: Date.now().toString() + Math.random() }))] }
        : folder
    ));
    setAddModalVisible(false);
    setNewMeds([{ name: '', dosage: '', instructions: '' }]);
  };

  const handleAddMedField = () => {
    setNewMeds(meds => [...meds, { name: '', dosage: '', instructions: '' }]);
  };

  const handleRemoveMedField = (index) => {
    setNewMeds(meds => meds.length > 1 ? meds.filter((_, i) => i !== index) : meds);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    if (folders.some(f => f.name.toLowerCase() === newFolderName.trim().toLowerCase())) return;
    setFolders(folders => [...folders, { name: newFolderName.trim(), medications: [] }]);
    setCreateFolderModalVisible(false);
    setNewFolderName('');
  };

  const handleUploadPrescription = async () => {
    try {
      setLoading(true);
      setUploadSummary(null);
      // Pick PDF
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) { setLoading(false); return; }
      const file = result.assets[0];
      // Prepare FormData
      const formData = new FormData();
      formData.append('pdf', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
      // Backend URL (update IP if needed)
      const backendUrl = 'http://192.168.1.3:4000/extract-text';
      // Extract text from PDF
      const response = await axios.post(backendUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const pdfText = response.data.text;
      // Send to Gemini for medication extraction
      const prompt = `Extract all medication names, dosages, and instructions from the following prescription text. Return ONLY a JSON array (no explanation, no markdown, no extra text), where each item has fields: name, dosage, instructions.\n\nPrescription:\n${pdfText}`;
      const geminiResponse = await axios.post(
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
      let meds = [];
      let summary = '';
      if (geminiResponse.data.candidates && geminiResponse.data.candidates[0]) {
        const aiText = geminiResponse.data.candidates[0].content.parts[0].text;
        // Try to extract the first JSON array from the response
        let jsonMatch = aiText.match(/\[.*?\]/s);
        if (jsonMatch) {
          try {
            meds = JSON.parse(jsonMatch[0]);
            summary = `Added ${meds.length} medications from prescription.`;
          } catch {
            summary = 'Could not parse JSON, please check the prescription format.';
          }
        } else {
          // fallback: try to parse as bullet points
          const lines = aiText.split('\n').filter(l => l.trim());
          meds = lines.map(line => ({ name: line, dosage: '', instructions: '' }));
          summary = 'Could not parse as JSON, added as names only.';
        }
      }
      if (meds.length > 0) {
        setFolders(folders => folders.map(folder =>
          folder.name === selectedFolder
            ? { ...folder, medications: [...folder.medications, ...meds.map(med => ({ ...med, id: Date.now().toString() + Math.random() }))] }
            : folder
        ));
      }
      setUploadSummary(summary);
      setLoading(false);
    } catch (err) {
      setUploadSummary('Failed to process prescription.');
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2089dc' }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar backgroundColor="#2089dc" barStyle="light-content" />
        <View style={styles.headerModern}>
          <Text style={styles.headerTitleModern}>Medications</Text>
          <Text style={styles.headerSubtitleModern}>Track your medications and prescriptions</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          {!selectedFolder ? (
            // Folder list
            folders.length === 0 ? (
              <Text style={styles.emptyText}>No folders created yet.</Text>
            ) : (
              folders.map((folder) => (
                <TouchableOpacity
                  key={folder.name}
                  style={styles.folderCard}
                  onPress={() => handleOpenFolder(folder.name)}
                >
                  <Icon name="folder" type="material" color="#2089dc" size={32} containerStyle={{ marginRight: 12 }} />
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Icon name="chevron-right" type="material" color="#2089dc" size={28} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))
            )
          ) : (
            // Medications in selected folder
            <>
              <TouchableOpacity onPress={handleBackToFolders} style={styles.backButton}>
                <Icon name="arrow-back" type="material" color="#2089dc" size={28} />
                <Text style={styles.backText}>Folders</Text>
              </TouchableOpacity>
              {folders.find(f => f.name === selectedFolder)?.medications.length === 0 ? (
                <Text style={styles.emptyText}>No medications in this folder yet.</Text>
              ) : (
                folders.find(f => f.name === selectedFolder).medications.map((med) => (
                  <Card containerStyle={styles.card} key={med.id}>
                    <Card.Title style={styles.cardTitle}>{med.name}</Card.Title>
                    <Text style={styles.cardDosage}>{med.dosage}</Text>
                    <Text style={styles.cardInstructions}>{med.instructions}</Text>
                  </Card>
                ))
              )}
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPrescription} disabled={loading}>
                <Icon name="upload-file" type="material" color="#fff" size={24} />
                <Text style={styles.uploadButtonText}>{loading ? 'Processing...' : 'Upload Prescription'}</Text>
              </TouchableOpacity>
              {uploadSummary && <Text style={styles.uploadSummary}>{uploadSummary}</Text>}
            </>
          )}
        </ScrollView>
        {/* Floating Add Folder Button */}
        {!selectedFolder && (
          <TouchableOpacity style={styles.fab} onPress={() => setCreateFolderModalVisible(true)}>
            <Icon name="create-new-folder" type="material" color="#fff" size={32} />
          </TouchableOpacity>
        )}
        {/* Floating Add Medication Button */}
        {selectedFolder && (
          <TouchableOpacity style={styles.fab} onPress={handleAddMedication}>
            <Icon name="add" type="material" color="#fff" size={32} />
          </TouchableOpacity>
        )}
        {/* Add Medication Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContent}>
              <Text style={styles.modalTitle}>Add Medications</Text>
              <ScrollView style={{ maxHeight: 350 }}>
                {newMeds.map((med, idx) => (
                  <View key={idx} style={styles.medFieldContainer}>
                    <Text style={styles.medFieldLabel}>Medication {idx + 1}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Medication Name"
                      value={med.name}
                      onChangeText={text => setNewMeds(meds => meds.map((m, i) => i === idx ? { ...m, name: text } : m))}
                    />
                    <Text style={styles.inputHint}>e.g. Metformin, Atorvastatin</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Dosage"
                      value={med.dosage}
                      onChangeText={text => setNewMeds(meds => meds.map((m, i) => i === idx ? { ...m, dosage: text } : m))}
                    />
                    <Text style={styles.inputHint}>e.g. 500mg, 10mg</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Instructions"
                      value={med.instructions}
                      onChangeText={text => setNewMeds(meds => meds.map((m, i) => i === idx ? { ...m, instructions: text } : m))}
                      multiline
                    />
                    <Text style={styles.inputHint}>e.g. Take one tablet twice daily with meals</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
                      {newMeds.length > 1 && (
                        <Button
                          title="Remove"
                          type="clear"
                          onPress={() => handleRemoveMedField(idx)}
                          titleStyle={{ color: '#E53935' }}
                        />
                      )}
                    </View>
                    {idx < newMeds.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
                <Button
                  title="Add Another Medication"
                  type="outline"
                  onPress={handleAddMedField}
                  buttonStyle={{ borderColor: '#2089dc', marginTop: 10 }}
                  titleStyle={{ color: '#2089dc' }}
                  icon={<Icon name="add" type="material" color="#2089dc" size={20} containerStyle={{ marginRight: 6 }} />}
                />
              </ScrollView>
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
                  onPress={handleSaveMedication}
                  buttonStyle={{ backgroundColor: '#2089dc' }}
                />
              </View>
            </View>
          </View>
        </Modal>
        {/* Create Folder Modal */}
        <Modal
          visible={createFolderModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCreateFolderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContent}>
              <Text style={styles.modalTitle}>Create Folder</Text>
              <TextInput
                style={styles.input}
                placeholder="Folder Name"
                value={newFolderName}
                onChangeText={setNewFolderName}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button
                  title="Cancel"
                  type="outline"
                  onPress={() => setCreateFolderModalVisible(false)}
                  buttonStyle={{ marginRight: 10, borderColor: '#2089dc' }}
                  titleStyle={{ color: '#2089dc' }}
                />
                <Button
                  title="Create"
                  onPress={handleCreateFolder}
                  buttonStyle={{ backgroundColor: '#2089dc' }}
                />
              </View>
            </View>
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
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf0fb',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  folderName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#27348B',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backText: {
    color: '#2089dc',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
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
  cardDosage: {
    color: '#607D8B',
    fontSize: 14,
    marginBottom: 8,
  },
  cardInstructions: {
    color: '#333',
    fontSize: 15,
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
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 4,
  },
  inputHint: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  medFieldContainer: {
    marginBottom: 18,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
  },
  medFieldLabel: {
    fontWeight: 'bold',
    color: '#2089dc',
    marginBottom: 6,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2089dc',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  uploadSummary: {
    color: '#2089dc',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default MedicationsScreen; 