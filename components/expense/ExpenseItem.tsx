import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Expense, Activity, useAppContext } from '@/context/AppContext';

interface ExpenseItemProps {
  expense: Expense;
  onPress: (expense: Expense) => void;
}

export const ExpenseItem = memo(function ExpenseItem({ expense, onPress }: ExpenseItemProps) {
  const { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } = useAppContext();
  
  const categoryIcon = getCategoryIcon(expense.category);
  const categoryColor = getCategoryColor(expense.category);
  const formattedDate = formatDate(expense.date);
  const formattedAmount = formatCurrency(expense.amount);

  const handlePress = React.useCallback(() => {
    onPress(expense);
  }, [expense, onPress]);
  
  // Helper function to get activity icon
  const getActivityIcon = (activity: Activity): any => {
    switch (activity) {
      case 'meeting': return 'users';
      case 'client': return 'briefcase';
      case 'office': return 'building-o';
      case 'field': return 'map-marker';
      case 'other': return 'ellipsis-h';
      default: return 'circle';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryIcon, { backgroundColor: categoryColor.bg }]}>
        <FontAwesome name={categoryIcon as any} size={20} color={categoryColor.text} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
        
        <View style={styles.tagsContainer}>
          {expense.activity && (
            <View style={styles.activityTag}>
              <FontAwesome
                name={getActivityIcon(expense.activity)}
                size={12}
                color="#0f62fe"
                style={styles.activityIcon}
              />
              <Text style={styles.activityText}>
                {expense.activity.charAt(0).toUpperCase() + expense.activity.slice(1)}
              </Text>
            </View>
          )}
          
          {expense.category === 'other' && expense.customTag && (
            <Text style={styles.customTag}>Tag: {expense.customTag}</Text>
          )}
        </View>
        
        {expense.hasReceipt && (
          <View style={styles.receiptIndicator}>
            <FontAwesome name="file-text-o" size={14} color="#0f62fe" style={styles.receiptIcon} />
            <Text style={styles.receiptText}>Receipt attached</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.amount}>-{formattedAmount}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#525252',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 2,
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5f6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 2,
  },
  activityIcon: {
    marginRight: 4,
  },
  activityText: {
    fontSize: 11,
    color: '#0f62fe',
    fontWeight: '500',
  },
  customTag: {
    fontSize: 12,
    color: '#525252',
    marginTop: 2,
  },
  receiptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  receiptIcon: {
    marginRight: 4,
  },
  receiptText: {
    fontSize: 12,
    color: '#525252',
  },
  amount: {
    fontWeight: '600',
    marginLeft: 8,
    color: '#da1e28',
    textAlign: 'right',
  },
});