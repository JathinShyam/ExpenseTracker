import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/components/ThemedText';
import { DatePickerModal } from '@/components/DatePickerModal';
import { Category, Activity, Expense, useAppContext } from '@/context/AppContext';

interface EditExpenseModalProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}

export function EditExpenseModal({ visible, expense, onClose, onSave }: EditExpenseModalProps) {
  const { updateExpense } = useAppContext();
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [remarks, setRemarks] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [receiptFilename, setReceiptFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Update form when expense changes
  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setDate(expense.date);
      setCategory(expense.category);
      setActivity(expense.activity || null);
      setRemarks(expense.remarks || '');
      setCustomTag(expense.customTag || '');
      setReceiptUri(expense.receiptUri || null);
      setReceiptFilename(expense.receiptFilename || null);
      setErrorMessage('');
      setRemoveReceipt(false);
    }
  }, [expense]);

  // Reset form
  const resetForm = () => {
    if (!expense) return;
    
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setDate(expense.date);
    setCategory(expense.category);
    setActivity(expense.activity || null);
    setRemarks(expense.remarks || '');
    setCustomTag(expense.customTag || '');
    setReceiptUri(expense.receiptUri || null);
    setReceiptFilename(expense.receiptFilename || null);
    setErrorMessage('');
    setRemoveReceipt(false);
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle save
  const handleSave = async () => {
    if (!expense) return;
    
    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a title.');
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage('Please enter a valid positive amount.');
      return;
    }
    
    if (!date) {
      setErrorMessage('Please select a date.');
      return;
    }
    
    if (!category) {
      setErrorMessage('Please select a category.');
      return;
    }
    
    if (!activity) {
      setErrorMessage('Please select an activity.');
      return;
    }
    
    if (category === 'other' && !customTag.trim()) {
      setErrorMessage('Please enter a custom tag for the "Other" category.');
      return;
    }

    try {
      const hasReceipt = !removeReceipt && (!!receiptUri || (expense.hasReceipt && !receiptUri));
      
      await updateExpense({
        ...expense,
        title: title.trim(),
        amount: amountValue,
        date,
        category,
        activity,
        remarks: remarks.trim() || null,
        hasReceipt,
        receiptFilename: removeReceipt ? null : (receiptFilename || expense.receiptFilename),
        receiptUri: removeReceipt ? null : (receiptUri || expense.receiptUri),
        customTag: category === 'other' ? customTag.trim() : null,
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating expense:', error);
      setErrorMessage('Failed to update expense. Please try again.');
    }
  };

  // Handle receipt selection
  const handleSelectReceipt = async () => {
    try {
      // Ask user if they want to use camera or file picker
      if (Platform.OS === 'web') {
        // Web doesn't support ActionSheet, so just use document picker
        handleSelectFile();
      } else {
        Alert.alert(
          'Select Receipt',
          'Choose how to add a receipt',
          [
            {
              text: 'Take Photo',
              onPress: handleTakePhoto,
            },
            {
              text: 'Choose File',
              onPress: handleSelectFile,
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error selecting receipt:', error);
      Alert.alert('Error', 'Failed to select receipt. Please try again.');
    }
  };

  // Handle taking a photo
  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera permission to take photos.');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setReceiptUri(asset.uri);
        setReceiptFilename(asset.fileName || 'receipt.jpg');
        setRemoveReceipt(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Handle selecting a file
  const handleSelectFile = async () => {
    try {
      // Launch document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setReceiptUri(asset.uri);
        setReceiptFilename(asset.name);
        setRemoveReceipt(false);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  // Handle removing receipt
  const handleRemoveReceipt = () => {
    setReceiptUri(null);
    setReceiptFilename(null);
    setRemoveReceipt(true);
  };

  // Categories for selection
  const categories: { id: Category; label: string; icon: string }[] = [
    { id: 'food', label: 'Food', icon: 'cutlery' },
    { id: 'travel', label: 'Travel', icon: 'plane' },
    { id: 'stay', label: 'Stay', icon: 'building' },
    { id: 'transport', label: 'Transport', icon: 'car' },
    { id: 'other', label: 'Other', icon: 'tag' },
  ];
  
  // Activities for selection
  const activities: { id: Activity; label: string; icon: string }[] = [
    { id: 'meeting', label: 'Meeting', icon: 'users' },
    { id: 'client', label: 'Client', icon: 'briefcase' },
    { id: 'office', label: 'Office', icon: 'building-o' },
    { id: 'field', label: 'Field', icon: 'map-marker' },
    { id: 'other', label: 'Other', icon: 'ellipsis-h' },
  ];

  // If no expense is selected, don't render content
  if (!expense) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Edit Expense</ThemedText>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <FontAwesome name="close" size={20} color="#525252" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.formContainer}>
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Title</ThemedText>
                  <TextInput
                    style={styles.fieldInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g., Dinner with client"
                    placeholderTextColor="#8d8d8d"
                  />
                </View>
                
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Amount (₹)</ThemedText>
                  <TextInput
                    style={styles.fieldInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="e.g., 500.50"
                    placeholderTextColor="#8d8d8d"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Date</ThemedText>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setDatePickerVisible(true)}
                  >
                    <ThemedText>
                      {date ? new Date(date).toLocaleDateString() : 'Select date'}
                    </ThemedText>
                    <FontAwesome name="calendar" size={16} color="#525252" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Category</ThemedText>
                  <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          category === cat.id && styles.activeCategoryChip
                        ]}
                        onPress={() => setCategory(cat.id)}
                      >
                        <FontAwesome 
                          name={cat.icon as any} 
                          size={16} 
                          color={category === cat.id ? 'white' : '#161616'} 
                          style={styles.categoryIcon} 
                        />
                        <ThemedText style={[
                          styles.categoryLabel,
                          category === cat.id && styles.activeCategoryLabel
                        ]}>
                          {cat.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Activity</ThemedText>
                  <View style={styles.categoryContainer}>
                    {activities.map((act) => (
                      <TouchableOpacity
                        key={act.id}
                        style={[
                          styles.categoryChip,
                          activity === act.id && styles.activeCategoryChip
                        ]}
                        onPress={() => setActivity(act.id)}
                      >
                        <FontAwesome
                          name={act.icon as any}
                          size={16}
                          color={activity === act.id ? 'white' : '#161616'}
                          style={styles.categoryIcon}
                        />
                        <ThemedText style={[
                          styles.categoryLabel,
                          activity === act.id && styles.activeCategoryLabel
                        ]}>
                          {act.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Remarks (Optional)</ThemedText>
                  <TextInput
                    style={styles.fieldInput}
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Additional notes about this expense"
                    placeholderTextColor="#8d8d8d"
                    multiline={true}
                    numberOfLines={2}
                  />
                </View>
                
                {category === 'other' && (
                  <View style={styles.formField}>
                    <ThemedText style={styles.fieldLabel}>Custom Tag (for Other)</ThemedText>
                    <TextInput
                      style={styles.fieldInput}
                      value={customTag}
                      onChangeText={setCustomTag}
                      placeholder="e.g., Office Supplies"
                      placeholderTextColor="#8d8d8d"
                    />
                  </View>
                )}
                
                <View style={styles.formField}>
                  <ThemedText style={styles.fieldLabel}>Receipt (Optional)</ThemedText>
                  <TouchableOpacity 
                    style={styles.fileUpload}
                    onPress={handleSelectReceipt}
                  >
                    <FontAwesome name="upload" size={24} color="#525252" style={styles.uploadIcon} />
                    <ThemedText>Click to upload new receipt</ThemedText>
                    <ThemedText style={styles.fileUploadHint}>JPG, PNG or PDF (Max 5MB)</ThemedText>
                  </TouchableOpacity>
                  
                  {!removeReceipt && (receiptUri || expense.receiptUri) && (receiptFilename || expense.receiptFilename) && (
                    <View style={styles.filePreview}>
                      <FontAwesome name="file" size={16} color="#0c529d" style={styles.fileIcon} />
                      <ThemedText style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                        {receiptFilename || expense.receiptFilename}
                      </ThemedText>
                      <TouchableOpacity onPress={handleRemoveReceipt} style={styles.removeFileButton}>
                        <FontAwesome name="close" size={16} color="#0c529d" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                {errorMessage ? (
                  <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
                ) : null}
              </ScrollView>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <ThemedText style={styles.saveButtonText}>Update Expense</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={(selectedDate) => {
          setDate(selectedDate);
          setDatePickerVisible(false);
        }}
        currentDate={date}
        title="Select Date"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '90%',
    maxWidth: 340,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 16,
    maxHeight: 400,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#525252',
  },
  fieldInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#8d8d8d',
    paddingHorizontal: 8,
  },
  dateInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#8d8d8d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#0f62fe',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#161616',
  },
  activeCategoryLabel: {
    color: 'white',
  },
  fileUpload: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#8d8d8d',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginBottom: 8,
  },
  fileUploadHint: {
    fontSize: 12,
    color: '#525252',
    marginTop: 4,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  fileIcon: {
    marginRight: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#0c529d',
  },
  removeFileButton: {
    padding: 4,
  },
  errorMessage: {
    color: '#da1e28',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#0f62fe',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#161616',
    fontWeight: '600',
  },
});