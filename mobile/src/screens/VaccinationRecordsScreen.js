import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Icon, Button, Input, Overlay } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { isValid, parse, isAfter } from 'date-fns';

const VaccinationRecordsScreen = () => {
  const [records, setRecords] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newVaccine, setNewVaccine] = useState({
    name: '',
    date: '',
    nextDoseDate: '',
    provider: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const commonVaccines = [
    {
      name: 'COVID-19',
      icon: 'coronavirus',
      color: '#FF6B6B'
    },
    {
      name: 'Influenza',
      icon: 'medical-services',
      color: '#4ECDC4'
    },
    {
      name: 'MMR',
      icon: 'vaccines',
      color: '#45B7D1'
    },
    {
      name: 'Tetanus',
      icon: 'healing',
      color: '#96CEB4'
    },
    {
      name: 'Hepatitis B',
      icon: 'medication',
      color: '#FFEEAD'
    },
    {
      name: 'Varicella',
      icon: 'health-and-safety',
      color: '#D4A5A5'
    },
    {
      name: 'HPV',
      icon: 'shield',
      color: '#9B89B3'
    }
  ];

  const handleAddVaccine = () => {
    setError('');
    if (!newVaccine.name.trim()) {
      setError('Vaccine name is required.');
      return;
    }
    if (!newVaccine.date.trim()) {
      setError('Date received is required.');
      return;
    }
    const dateReceived = parse(newVaccine.date, 'MM/dd/yyyy', new Date());
    if (!isValid(dateReceived)) {
      setError('Date received must be a valid date (MM/DD/YYYY).');
      return;
    }
    if (newVaccine.nextDoseDate.trim()) {
      const nextDose = parse(newVaccine.nextDoseDate, 'MM/dd/yyyy', new Date());
      if (!isValid(nextDose)) {
        setError('Next dose date must be a valid date (MM/DD/YYYY).');
        return;
      }
      if (!isAfter(nextDose, dateReceived)) {
        setError('Next dose date must be after the date received.');
        return;
      }
    }
    setRecords([...records, { ...newVaccine, id: Date.now().toString() }]);
    setNewVaccine({
      name: '',
      date: '',
      nextDoseDate: '',
      provider: '',
      notes: '',
    });
    setIsAddModalVisible(false);
  };

  const handleDeleteVaccine = (id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this vaccination record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => setRecords(records.filter(r => r.id !== id)),
          style: 'destructive',
        },
      ]
    );
  };

  const renderAddModal = () => (
    <Overlay
      isVisible={isAddModalVisible}
      onBackdropPress={() => setIsAddModalVisible(false)}
      overlayStyle={styles.modal}
    >
      <ScrollView>
        <Text h4 style={styles.modalTitle}>Add Vaccination</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Input label="Vaccine Name" value={newVaccine.name}
          onChangeText={(text) => setNewVaccine({ ...newVaccine, name: text })}
          placeholder="Enter vaccine name" />
        <Input label="Date Received" value={newVaccine.date}
          onChangeText={(text) => setNewVaccine({ ...newVaccine, date: text })}
          placeholder="MM/DD/YYYY" />
        <Input label="Next Dose Date (Optional)" value={newVaccine.nextDoseDate}
          onChangeText={(text) => setNewVaccine({ ...newVaccine, nextDoseDate: text })}
          placeholder="MM/DD/YYYY" />
        <Input label="Provider" value={newVaccine.provider}
          onChangeText={(text) => setNewVaccine({ ...newVaccine, provider: text })}
          placeholder="Enter provider name" />
        <Input label="Notes" value={newVaccine.notes}
          onChangeText={(text) => setNewVaccine({ ...newVaccine, notes: text })}
          placeholder="Any additional notes" multiline />
        <View style={styles.modalButtons}>
          <Button title="Cancel" type="outline"
            onPress={() => setIsAddModalVisible(false)}
            containerStyle={styles.modalButton} />
          <Button title="Add" onPress={handleAddVaccine}
            containerStyle={styles.modalButton} />
        </View>
      </ScrollView>
    </Overlay>
  );

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2089dc' }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar backgroundColor="#2089dc" barStyle="light-content" />
        <View style={styles.container}>
          <View style={styles.headerModern}>
            <Text style={styles.headerTitleModern}>Vaccination Records</Text>
            <Text style={styles.headerSubtitleModern}>Track and manage your vaccine history</Text>
          </View>
          {/* Common Vaccines Grid */}
          <View style={styles.commonVaccinesContainer}>
            <Text style={styles.sectionTitle}>Common Vaccines</Text>
            <View style={styles.vaccineGrid}>
              {commonVaccines.map((vaccine, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.vaccineCard}
                  onPress={() => {
                    setNewVaccine({ ...newVaccine, name: vaccine.name });
                    setIsAddModalVisible(true);
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: vaccine.color }]}>
                    <Icon
                      name={vaccine.icon}
                      type="material"
                      color="#fff"
                      size={24}
                    />
                  </View>
                  <Text style={styles.vaccineCardText}>{vaccine.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.recordsContainer}>
            <Text style={styles.recordsTitleModern}>Your Records</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 80, marginTop: 10 }}>
              {records.map((record) => (
                <View key={record.id} style={styles.cardModern}>
                  <View style={styles.cardHeaderModern}>
                    <Icon name="vaccines" type="material" color="#2089dc" size={28} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.cardTitleModern}>{record.name}</Text>
                      <Text style={styles.cardSubModern}>Date: {record.date}</Text>
                      {record.nextDoseDate && <Text style={styles.cardSubModern}>Next: {record.nextDoseDate}</Text>}
                      {record.provider && <Text style={styles.cardSubModern}>Provider: {record.provider}</Text>}
                      {record.notes && <Text style={styles.cardNoteModern}>Note: {record.notes}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteVaccine(record.id)}>
                      <Icon name="delete" type="material" color="#E53935" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          {/* Floating Add Button */}
          <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalVisible(true)}>
            <Icon name="add" type="material" color="#fff" size={32} />
          </TouchableOpacity>
          {renderAddModal()}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontWeight: '700',
    color: '#1A237E',
  },
  headerSubtitle: {
    color: '#607D8B',
    marginTop: 4,
  },
  quickAddContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  quickAddButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  quickAddText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  recordsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  card: {
    backgroundColor: '#f8fafd',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSub: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  cardNote: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
    fontStyle: 'italic',
  },
  modal: {
    width: '90%',
    maxHeight: '85%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  errorText: {
    color: '#E53935',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerModern: {
    backgroundColor: '#2089dc',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerTitleModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 4,
  },
  headerSubtitleModern: {
    color: '#eaf0fb',
    fontSize: 15,
  },
  quickAddModernContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  quickAddModernCard: {
    backgroundColor: '#eaf0fb',
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAddModernText: {
    color: '#2089dc',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  recordsTitleModern: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2089dc',
    marginBottom: 10,
    marginLeft: 4,
  },
  cardModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleModern: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#27348B',
  },
  cardSubModern: {
    color: '#607D8B',
    fontSize: 14,
    marginTop: 2,
  },
  cardNoteModern: {
    color: '#2089dc',
    fontSize: 13,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#2089dc',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  commonVaccinesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  vaccineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vaccineCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccineCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
});

export default VaccinationRecordsScreen;
