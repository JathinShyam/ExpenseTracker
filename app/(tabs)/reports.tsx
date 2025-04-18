import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { DatePickerModal } from '@/components/DatePickerModal';
import { useAppContext } from '@/context/AppContext';

export default function ReportsScreen() {
  const { expenses, formatCurrency, userProfile, getDayOfWeek } = useAppContext();
  
  // State for date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  
  // State for date picker modals
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

  // Generate a simple CSV report
  const generateReport = async () => {
    if (!startDate || !endDate) {
      setMessage('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setMessage('Start date cannot be after end date.');
      return;
    }

    // Filter expenses within date range
    const filteredExpenses = expenses.filter(expense => {
      const expDate = new Date(expense.date);
      return expDate >= start && expDate <= end;
    });

    if (filteredExpenses.length === 0) {
      setMessage('No expenses found in the selected date range.');
      return;
    }

    try {
      // Create CSV content with header
      let csvContent = 'EXPENSE REPORT\n';
      csvContent += `Generated on: ${format(new Date(), 'MMMM d, yyyy')}\n`;
      csvContent += `Period: ${format(start, 'MMMM d, yyyy')} to ${format(end, 'MMMM d, yyyy')}\n\n`;
      
      // Add user information
      csvContent += 'USER INFORMATION\n';
      csvContent += `Name: ${userProfile.name}\n`;
      csvContent += `Email: ${userProfile.email}\n`;
      csvContent += `Department: ${userProfile.department}\n`;
      csvContent += `Employee ID: ${userProfile.employeeId}\n\n`;
      
      // Add expense data with day of week
      csvContent += 'EXPENSE DETAILS\n';
      csvContent += 'Date,Day,Title,Category,Activity,Amount,Remarks,Has Receipt\n';
      
      filteredExpenses.forEach(expense => {
        const formattedDate = format(new Date(expense.date), 'yyyy-MM-dd');
        const dayOfWeek = getDayOfWeek(expense.date);
        const customTag = expense.category === 'other' && expense.customTag
          ? ` (${expense.customTag})`
          : '';
        const activity = expense.activity || '';
        const remarks = expense.remarks || '';
        
        csvContent += `${formattedDate},${dayOfWeek},"${expense.title}","${expense.category}${customTag}","${activity}",${expense.amount},"${remarks}",${expense.hasReceipt ? 'Yes' : 'No'}\n`;
      });

      // Calculate total
      const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      csvContent += `\nTotal,,,,,"${formatCurrency(total)}",`;

      // Save to a temporary file
      const fileName = `expense_report_${format(start, 'yyyyMMdd')}_to_${format(end, 'yyyyMMdd')}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csvContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
        setMessage(`Report with ${filteredExpenses.length} expenses generated successfully.`);
      } else {
        setMessage('Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage('Error generating report. Please try again.');
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Generate Report</ThemedText>
      </View>
      
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Date Range</ThemedText>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <ThemedText style={styles.dateLabel}>Start Date</ThemedText>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setStartDatePickerVisible(true)}
            >
              <ThemedText>
                {startDate ? formatDateForDisplay(startDate) : 'Select date'}
              </ThemedText>
              <FontAwesome name="calendar" size={16} color="#525252" style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateItem}>
            <ThemedText style={styles.dateLabel}>End Date</ThemedText>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setEndDatePickerVisible(true)}
            >
              <ThemedText>
                {endDate ? formatDateForDisplay(endDate) : 'Select date'}
              </ThemedText>
              <FontAwesome name="calendar" size={16} color="#525252" style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={generateReport}
        >
          <FontAwesome name="download" size={18} color="white" style={styles.buttonIcon} />
          <ThemedText style={styles.buttonText}>Generate Excel Report</ThemedText>
        </TouchableOpacity>
        
        {message ? (
          <ThemedText style={styles.message}>{message}</ThemedText>
        ) : null}
      </View>
      
      {/* Date Picker Modals */}
      <DatePickerModal
        visible={startDatePickerVisible}
        onClose={() => setStartDatePickerVisible(false)}
        onSelectDate={(date) => setStartDate(date)}
        currentDate={startDate}
        title="Select Start Date"
      />
      
      <DatePickerModal
        visible={endDatePickerVisible}
        onClose={() => setEndDatePickerVisible(false)}
        onSelectDate={(date) => setEndDate(date)}
        currentDate={endDate}
        title="Select End Date"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dateItem: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#525252',
  },
  dateInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#8d8d8d',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  generateButton: {
    backgroundColor: '#0f62fe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: '#525252',
  },
});