import React, { useState } from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  currentDate?: string; // In YYYY-MM-DD format
  title?: string;
}

export function DatePickerModal({ 
  visible, 
  onClose, 
  onSelectDate, 
  currentDate,
  title = 'Select Date'
}: DatePickerModalProps) {
  // Parse the current date or use today
  const initialDate = currentDate 
    ? new Date(currentDate) 
    : new Date();
  
  // State for the calendar
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Handle month change
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDay(1); // Reset selected day when changing month
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDay(1); // Reset selected day when changing month
  };
  
  // Handle day selection
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
  };
  
  // Handle confirm selection
  const handleConfirm = () => {
    // Format as YYYY-MM-DD
    const month = String(selectedMonth + 1).padStart(2, '0');
    const day = String(selectedDay).padStart(2, '0');
    const dateString = `${selectedYear}-${month}-${day}`;
    
    onSelectDate(dateString);
    onClose();
  };
  
  // Generate years array for picker (10 years before and after current year)
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }, []);
  
  // Month names for picker
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Handle year selection
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };
  
  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setShowMonthPicker(false);
  };
  
  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth);
    
    // Create array of day numbers
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Add empty slots for days before the first day of the month
    const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    
    // Combine empty slots and days
    const allSlots = [...emptySlots, ...days];
    
    // Calculate how many empty slots we need to add at the end to make complete weeks
    const remainingSlots = (7 - (allSlots.length % 7)) % 7;
    const fillerSlots = Array.from({ length: remainingSlots }, (_, i) => null);
    const completeSlots = [...allSlots, ...fillerSlots];
    
    // Split into weeks (rows)
    const weeks = [];
    for (let i = 0; i < completeSlots.length; i += 7) {
      weeks.push(completeSlots.slice(i, i + 7));
    }
    
    return (
      <View style={styles.calendar}>
        {/* Day headers */}
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <ThemedText style={styles.weekDayText}>{day}</ThemedText>
            </View>
          ))}
        </View>
        
        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayCell,
                  day === selectedDay && styles.selectedDayCell,
                  !day && styles.emptyCell
                ]}
                onPress={() => day && handleSelectDay(day)}
                disabled={!day}
              >
                {day ? (
                  <ThemedText style={[
                    styles.dayText,
                    day === selectedDay && styles.selectedDayText
                  ]}>
                    {day}
                  </ThemedText>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };
  
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
                <ThemedText type="subtitle">{title}</ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FontAwesome name="close" size={20} color="#525252" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.calendarContainer}>
                {/* Month/Year selection and navigation */}
                <View style={styles.monthNavigation}>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                    <FontAwesome name="chevron-left" size={16} color="#525252" />
                  </TouchableOpacity>
                  
                  <View style={styles.monthYearSelector}>
                    <TouchableOpacity
                      style={styles.monthYearButton}
                      onPress={() => {
                        setShowMonthPicker(true);
                        setShowYearPicker(false);
                      }}
                    >
                      <ThemedText style={styles.monthYearText}>
                        {format(new Date(selectedYear, selectedMonth), 'MMMM')}
                      </ThemedText>
                      <FontAwesome name="caret-down" size={14} color="#525252" style={styles.dropdownIcon} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.monthYearButton}
                      onPress={() => {
                        setShowYearPicker(true);
                        setShowMonthPicker(false);
                      }}
                    >
                      <ThemedText style={styles.monthYearText}>
                        {selectedYear}
                      </ThemedText>
                      <FontAwesome name="caret-down" size={14} color="#525252" style={styles.dropdownIcon} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <FontAwesome name="chevron-right" size={16} color="#525252" />
                  </TouchableOpacity>
                </View>
                
                {/* Month Picker */}
                {showMonthPicker && (
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.pickerScrollView}>
                      {months.map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.pickerItem,
                            selectedMonth === index && styles.pickerItemSelected
                          ]}
                          onPress={() => handleMonthSelect(index)}
                        >
                          <ThemedText style={[
                            styles.pickerItemText,
                            selectedMonth === index && styles.pickerItemTextSelected
                          ]}>
                            {month}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                {/* Year Picker */}
                {showYearPicker && (
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.pickerScrollView}>
                      {years.map(year => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.pickerItem,
                            selectedYear === year && styles.pickerItemSelected
                          ]}
                          onPress={() => handleYearSelect(year)}
                        >
                          <ThemedText style={[
                            styles.pickerItemText,
                            selectedYear === year && styles.pickerItemTextSelected
                          ]}>
                            {year}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                {/* Calendar */}
                {renderCalendar()}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
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
  calendarContainer: {
    padding: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f4f4f4',
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownIcon: {
    marginLeft: 2,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemSelected: {
    backgroundColor: '#e5f6ff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#0f62fe',
    fontWeight: '500',
  },
  calendar: {
    width: '100%',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '500',
  },
  week: {
    flexDirection: 'row',
    marginBottom: 8,
    height: 40,
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedDayCell: {
    backgroundColor: '#0f62fe',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
  },
  selectedDayText: {
    color: 'white',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#0f62fe',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmButtonText: {
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