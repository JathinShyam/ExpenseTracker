import React from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Alert,
  Linking
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ThemedText } from '@/components/ThemedText';
import { Expense, Activity, useAppContext } from '@/context/AppContext';

interface ViewExpenseModalProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

export function ViewExpenseModal({ 
  visible, 
  expense, 
  onClose, 
  onEdit, 
  onDelete 
}: ViewExpenseModalProps) {
  const { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } = useAppContext();

  // Handle delete
  const handleDelete = () => {
    if (!expense) return;
    
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(expense.id);
            onClose();
          },
        },
      ]
    );
  };

  // Handle edit
  const handleEdit = () => {
    if (!expense) return;
    onEdit(expense);
    onClose();
  };

  // Handle view receipt
  const handleViewReceipt = async () => {
    if (!expense || !expense.hasReceipt || !expense.receiptUri) return;
    
    try {
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(expense.receiptUri);
      
      if (fileInfo.exists) {
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(expense.receiptUri);
        } else {
          // If sharing is not available, try to open the file
          await Linking.openURL(expense.receiptUri);
        }
      } else {
        Alert.alert('Error', 'Receipt file not found.');
      }
    } catch (error) {
      console.error('Error viewing receipt:', error);
      Alert.alert('Error', 'Failed to open receipt. Please try again.');
    }
  };

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

  // Get category styling
  const categoryIcon = getCategoryIcon(expense.category);
  const categoryColor = getCategoryColor(expense.category);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Expense Details</ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FontAwesome name="close" size={20} color="#525252" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <FontAwesome name="file-text-o" size={20} color="#525252" style={styles.detailIcon} />
                  <View>
                    <ThemedText style={styles.detailLabel}>Title</ThemedText>
                    <ThemedText style={styles.detailValue}>{expense.title}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.detailItem}>
                  <FontAwesome name="money" size={20} color="#525252" style={styles.detailIcon} />
                  <View>
                    <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                    <ThemedText style={[styles.detailValue, styles.amountValue]}>
                      {formatCurrency(expense.amount)}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.detailItem}>
                  <FontAwesome name="calendar" size={20} color="#525252" style={styles.detailIcon} />
                  <View>
                    <ThemedText style={styles.detailLabel}>Date</ThemedText>
                    <ThemedText style={styles.detailValue}>{formatDate(expense.date)}</ThemedText>
                  </View>
                </View>
                
                {expense.activity && (
                  <View style={styles.detailItem}>
                    <FontAwesome name="tasks" size={20} color="#525252" style={styles.detailIcon} />
                    <View>
                      <ThemedText style={styles.detailLabel}>Activity</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {expense.activity.charAt(0).toUpperCase() + expense.activity.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                )}
                
                {expense.remarks && (
                  <View style={styles.detailItem}>
                    <FontAwesome name="comment" size={20} color="#525252" style={styles.detailIcon} />
                    <View>
                      <ThemedText style={styles.detailLabel}>Remarks</ThemedText>
                      <ThemedText style={styles.detailValue}>{expense.remarks}</ThemedText>
                    </View>
                  </View>
                )}
                
                <View style={styles.detailItem}>
                  <FontAwesome name="tag" size={20} color="#525252" style={styles.detailIcon} />
                  <View>
                    <ThemedText style={styles.detailLabel}>Category</ThemedText>
                    <View style={styles.categoryContainer}>
                      <View 
                        style={[
                          styles.categoryChip, 
                          { backgroundColor: categoryColor.bg }
                        ]}
                      >
                        <FontAwesome 
                          name={categoryIcon as any} 
                          size={16} 
                          color={categoryColor.text} 
                          style={styles.categoryChipIcon} 
                        />
                        <ThemedText 
                          style={[
                            styles.categoryChipText, 
                            { color: categoryColor.text }
                          ]}
                        >
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </ThemedText>
                      </View>
                      
                      {expense.category === 'other' && expense.customTag && (
                        <ThemedText style={styles.customTag}>
                          ({expense.customTag})
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </View>
                
                {expense.hasReceipt && (
                  <View style={styles.detailItem}>
                    <FontAwesome name="file" size={20} color="#525252" style={styles.detailIcon} />
                    <View style={styles.receiptContainer}>
                      <ThemedText style={styles.detailLabel}>Receipt</ThemedText>
                      
                      {expense.receiptUri ? (
                        <TouchableOpacity 
                          style={styles.receiptPreview}
                          onPress={handleViewReceipt}
                        >
                          <FontAwesome name="file-text-o" size={16} color="#0043ce" style={styles.receiptIcon} />
                          <ThemedText style={styles.receiptText} numberOfLines={1} ellipsizeMode="middle">
                            {expense.receiptFilename || 'View Receipt'}
                          </ThemedText>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.noReceiptPreview}>
                          <FontAwesome name="file-text-o" size={16} color="#525252" style={styles.receiptIcon} />
                          <ThemedText style={styles.noReceiptText} numberOfLines={1}>
                            {expense.receiptFilename || 'Receipt not available'}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <FontAwesome name="trash" size={16} color="#c62828" style={styles.actionButtonIcon} />
                  <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleEdit}
                >
                  <FontAwesome name="edit" size={16} color="#161616" style={styles.actionButtonIcon} />
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  detailsContainer: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#525252',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#161616',
  },
  amountValue: {
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryChipIcon: {
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customTag: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#393939',
  },
  receiptContainer: {
    flex: 1,
  },
  receiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  noReceiptPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  receiptIcon: {
    marginRight: 8,
  },
  receiptText: {
    flex: 1,
    fontSize: 14,
    color: '#0043ce',
  },
  noReceiptText: {
    flex: 1,
    fontSize: 14,
    color: '#525252',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#c62828',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#161616',
    fontWeight: '500',
  },
  actionButtonIcon: {
    marginRight: 6,
  },
});