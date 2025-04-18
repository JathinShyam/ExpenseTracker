import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAppContext, UserProfile } from '@/context/AppContext';

export default function ProfileScreen() {
  const { userProfile, updateUserProfile } = useAppContext();
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [message, setMessage] = useState('');

  // Handle profile image selection
  const handleSelectImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos.');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Update profile image in state
        setEditedProfile({
          ...editedProfile,
          profileImageUri: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Handle save profile changes
  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(editedProfile);
      setMessage('Profile updated successfully!');
      
      // Exit edit mode after a delay
      setTimeout(() => {
        setIsEditMode(false);
        setMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert('Logout', 'Logout functionality not implemented in this demo.');
  };

  // Render profile view mode
  const renderProfileView = () => (
    <View style={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {userProfile.profileImageUri ? (
            <Image 
              source={{ uri: userProfile.profileImageUri }} 
              style={styles.profileImage} 
            />
          ) : (
            <FontAwesome name="user" size={40} color="#0043ce" />
          )}
        </View>
        <ThemedText type="subtitle">{userProfile.name}</ThemedText>
        <ThemedText style={styles.email}>{userProfile.email}</ThemedText>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Full Name</ThemedText>
          <ThemedText style={styles.detailValue}>{userProfile.name}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Email</ThemedText>
          <ThemedText style={styles.detailValue}>{userProfile.email}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Department</ThemedText>
          <ThemedText style={styles.detailValue}>{userProfile.department}</ThemedText>
        </View>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Employee ID</ThemedText>
          <ThemedText style={styles.detailValue}>{userProfile.employeeId}</ThemedText>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditMode(true)}
        >
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Expenso Track v1.0{'\n'}
          Developed by Dev Team
        </ThemedText>
      </View>
    </View>
  );

  // Render profile edit mode
  const renderProfileEdit = () => (
    <ScrollView style={styles.content}>
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={handleSelectImage}
        >
          {editedProfile.profileImageUri ? (
            <Image 
              source={{ uri: editedProfile.profileImageUri }} 
              style={styles.profileImage} 
            />
          ) : (
            <FontAwesome name="user" size={40} color="#0043ce" />
          )}
          <View style={styles.changePhotoButton}>
            <FontAwesome name="camera" size={14} color="white" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.changePhotoTextButton}
          onPress={handleSelectImage}
        >
          <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Full Name</ThemedText>
          <TextInput
            style={styles.fieldInput}
            value={editedProfile.name}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
          />
        </View>
        
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Email</ThemedText>
          <TextInput
            style={styles.fieldInput}
            value={editedProfile.email}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Department</ThemedText>
          <TextInput
            style={styles.fieldInput}
            value={editedProfile.department}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, department: text })}
          />
        </View>
        
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Employee ID</ThemedText>
          <TextInput
            style={[styles.fieldInput, styles.disabledInput]}
            value={editedProfile.employeeId}
            editable={false}
          />
        </View>
      </View>
      
      {message ? (
        <ThemedText style={styles.message}>{message}</ThemedText>
      ) : null}
      
      <View style={styles.editButtonsContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveProfile}
        >
          <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => {
            setEditedProfile(userProfile);
            setIsEditMode(false);
          }}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {isEditMode ? 'Edit Profile' : 'My Profile'}
        </ThemedText>
        
        {isEditMode && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setEditedProfile(userProfile);
              setIsEditMode(false);
            }}
          >
            <FontAwesome name="arrow-left" size={20} color="#0f62fe" />
          </TouchableOpacity>
        )}
      </View>
      
      {isEditMode ? renderProfileEdit() : renderProfileView()}
    </ThemedView>
  );
}

// Import TextInput here to avoid the error in the component
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d0e2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  email: {
    color: '#525252',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  detailLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    color: '#525252',
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#0f62fe',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#da1e28',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#525252',
    textAlign: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0f62fe',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoTextButton: {
    marginBottom: 16,
  },
  changePhotoText: {
    color: '#0f62fe',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#525252',
    marginBottom: 4,
  },
  fieldInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#8d8d8d',
    paddingHorizontal: 8,
  },
  disabledInput: {
    backgroundColor: '#f4f4f4',
    color: '#525252',
  },
  editButtonsContainer: {
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#0f62fe',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
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
  message: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#198038',
  },
});