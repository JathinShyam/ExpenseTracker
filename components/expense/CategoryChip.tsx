import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Category, useAppContext } from '@/context/AppContext';

interface CategoryChipProps {
  category: Category | 'all';
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

export const CategoryChip = memo(function CategoryChip({
  category,
  label,
  isActive = false,
  onPress
}: CategoryChipProps) {
  const { getCategoryIcon, getCategoryColor } = useAppContext();
  
  // Handle the 'all' category specially
  const iconName = category === 'all' ? 'tags' : getCategoryIcon(category as Category);
  const colors = category === 'all'
    ? { bg: '#e0e0e0', text: '#161616' }
    : getCategoryColor(category as Category);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.bg },
        isActive && styles.activeContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <FontAwesome name={iconName as any} size={16} color={isActive ? '#ffffff' : colors.text} style={styles.icon} />
      <Text style={[
        styles.label,
        { color: isActive ? '#ffffff' : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    height: 32, // Fixed height for all chips
    minWidth: 80, // Minimum width to ensure consistency
  },
  activeContainer: {
    backgroundColor: '#0f62fe',
    // No change in height or padding when active
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});