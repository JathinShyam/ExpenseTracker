import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

// Define types
export type Category = 'food' | 'travel' | 'stay' | 'transport' | 'other';
export type Activity = 'meeting' | 'client' | 'office' | 'field' | 'other';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: Category;
  activity?: Activity | null;
  remarks?: string | null;
  hasReceipt: boolean;
  receiptFilename?: string | null;
  receiptUri?: string | null;
  customTag?: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  department: string;
  employeeId: string;
  profileImageUri?: string | null;
}

interface AppContextType {
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  
  // Filtering
  filteredExpenses: Expense[];
  currentFilterCategory: string;
  searchTerm: string;
  setFilterCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  
  // Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  
  // Utility functions
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatDateWithDay: (dateString: string) => string;
  getDayOfWeek: (dateString: string) => string;
  getCategoryIcon: (category: Category) => any;
  getCategoryColor: (category: Category) => { bg: string; text: string };
}

// Default values
const defaultProfile: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@company.com',
  department: 'Sales',
  employeeId: 'EMP-12345',
  profileImageUri: null,
};

// Sample expenses data
const sampleExpenses: Expense[] = [
  {
    id: 1,
    title: "Lunch Meeting",
    amount: 3500.50,
    date: "2024-05-15",
    category: "food",
    activity: "client",
    remarks: "Meeting with potential client",
    hasReceipt: true,
    receiptFilename: "lunch_receipt.jpg",
    receiptUri: null
  },
  {
    id: 2,
    title: "Conference Hotel",
    amount: 12000.00,
    date: "2024-05-14",
    category: "stay",
    activity: "meeting",
    remarks: "Annual industry conference",
    hasReceipt: true,
    receiptFilename: "hotel_invoice.pdf",
    receiptUri: null
  },
  {
    id: 3,
    title: "Flight to Delhi",
    amount: 5500.99,
    date: "2024-05-13",
    category: "travel",
    activity: "field",
    remarks: "Site visit to Delhi office",
    hasReceipt: false,
    receiptFilename: null,
    receiptUri: null
  },
  {
    id: 4,
    title: "Taxi from Airport",
    amount: 850.20,
    date: "2024-05-14",
    category: "transport",
    activity: "field",
    remarks: "Transport to hotel",
    hasReceipt: false,
    receiptFilename: null,
    receiptUri: null
  },
  {
    id: 5,
    title: "Client Coffee",
    amount: 450.00,
    date: "2024-05-16",
    category: "food",
    activity: "client",
    remarks: "Follow-up discussion",
    hasReceipt: false,
    receiptFilename: null,
    receiptUri: null
  },
  {
    id: 6,
    title: "Software Subscription",
    amount: 2500.00,
    date: "2024-05-01",
    category: "other",
    activity: "office",
    remarks: "Annual subscription renewal",
    hasReceipt: true,
    receiptFilename: "sub_confirm.png",
    customTag: "Adobe CC",
    receiptUri: null
  }
];

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const EXPENSES_STORAGE_KEY = 'expenses_data';
const PROFILE_STORAGE_KEY = 'user_profile';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [currentFilterCategory, setCurrentFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load expenses
        const storedExpenses = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        } else {
          // Use sample data for first run
          setExpenses(sampleExpenses);
          await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(sampleExpenses));
        }

        // Load profile
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        } else {
          // Use default profile for first run
          await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Filter expenses based on category and search term
  const filteredExpenses = React.useMemo(() => {
    return expenses
      .filter(expense => {
        const categoryMatch = currentFilterCategory === 'all' || expense.category === currentFilterCategory;
        const searchMatch = !searchTerm || expense.title.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }, [expenses, currentFilterCategory, searchTerm]);

  // Add a new expense
  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
      const expenseWithId = { ...newExpense, id: newId };
      const updatedExpenses = [...expenses, expenseWithId];
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  // Update an existing expense
  const updateExpense = async (updatedExpense: Expense) => {
    try {
      const updatedExpenses = expenses.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      );
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  // Delete an expense
  const deleteExpense = async (id: number) => {
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (profile: UserProfile) => {
    try {
      setUserProfile(profile);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Set filter category
  const setFilterCategory = (category: string) => {
    setCurrentFilterCategory(category);
  };

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  const formatDateWithDay = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'EEE, MMMM d, yyyy');
  };
  
  const getDayOfWeek = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'EEE');
  };

  const getCategoryIcon = (category: Category): any => {
    switch (category) {
      case 'food': return 'cutlery';
      case 'travel': return 'plane';
      case 'stay': return 'building';
      case 'transport': return 'car';
      case 'other': return 'tag';
      default: return 'tag';
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'food': return { bg: '#fff1f1', text: '#da1e28' }; // Light red / Red
      case 'travel': return { bg: '#e5f6ff', text: '#0043ce' }; // Light blue / Blue
      case 'stay': return { bg: '#f3e8ff', text: '#8a3ffc' }; // Light purple / Purple
      case 'transport': return { bg: '#defbe6', text: '#198038' }; // Light green / Green
      case 'other': return { bg: '#e0e0e0', text: '#161616' }; // Gray for other
      default: return { bg: '#e0e0e0', text: '#161616' }; // Gray
    }
  };

  const contextValue: AppContextType = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    filteredExpenses,
    currentFilterCategory,
    searchTerm,
    setFilterCategory,
    setSearchTerm,
    userProfile,
    updateUserProfile,
    formatCurrency,
    formatDate,
    formatDateWithDay,
    getDayOfWeek,
    getCategoryIcon,
    getCategoryColor,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};