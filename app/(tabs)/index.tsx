import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CategoryChip } from '@/components/expense/CategoryChip';
import { ExpenseItem } from '@/components/expense/ExpenseItem';
import { AddExpenseModal } from '@/components/expense/AddExpenseModal';
import { ViewExpenseModal } from '@/components/expense/ViewExpenseModal';
import { EditExpenseModal } from '@/components/expense/EditExpenseModal';
import { useAppContext, Expense, Category } from '@/context/AppContext';

export default function ExpensesScreen() {
  const {
    filteredExpenses,
    currentFilterCategory,
    setFilterCategory,
    searchTerm,
    setSearchTerm,
    deleteExpense
  } = useAppContext();

  // State for modals
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Handle expense item press
  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewModalVisible(true);
  };

  // Handle add expense button press
  const handleAddExpense = () => {
    setIsAddModalVisible(true);
  };

  // Handle edit expense
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalVisible(true);
  };

  // Handle delete expense
  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Categories for filter chips
  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'food', label: 'Food' },
    { id: 'travel', label: 'Travel' },
    { id: 'stay', label: 'Stay' },
    { id: 'transport', label: 'Transport' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Expenses</ThemedText>
      </View>
      
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color="#525252" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#525252"
        />
      </View>
      
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
          bounces={false}
        >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category.id as Category | 'all'}
            label={category.label}
            isActive={currentFilterCategory === category.id}
            onPress={() => setFilterCategory(category.id)}
          />
        ))}
        </ScrollView>
      </View>
      
      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="search-minus" size={48} color="#525252" />
          <ThemedText style={styles.emptyText}>
            {searchTerm || currentFilterCategory !== 'all'
              ? 'No expenses match the current filters.'
              : 'No expenses yet. Click "+" to add one!'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ExpenseItem expense={item} onPress={handleExpensePress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Modals */}
      <AddExpenseModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={() => setIsAddModalVisible(false)}
      />
      
      <ViewExpenseModal
        visible={isViewModalVisible}
        expense={selectedExpense}
        onClose={() => setIsViewModalVisible(false)}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />
      
      <EditExpenseModal
        visible={isEditModalVisible}
        expense={selectedExpense}
        onClose={() => setIsEditModalVisible(false)}
        onSave={() => setIsEditModalVisible(false)}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  categoriesWrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1, // Ensure it stays above the list
  },
  categoriesContainer: {
    height: 50, // Fixed height for the container
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    alignItems: 'center', // Center items vertically
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#525252',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f62fe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
