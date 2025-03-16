import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addSnap } from '../redux/snapsSlice';
import { firestore, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import PrivacyService from '../services/PrivacyService';

const CameraScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [flash, setFlash] = useState('off');
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [enableEncryption, setEnableEncryption] = useState(true);
  const [enableContentScan, setEnableContentScan] = useState(true);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  
  // Get quick share mode from route params
  const quickShareMode = route.params?.quickShareMode || false;
  
  const cameraRef = useRef(null);
  const privacyService = useRef(new PrivacyService()).current;
  
  const user = useSelector(state => state.user.user);
  const friendGroups = useSelector(state => state.user.friendGroups);
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  const dispatch = useDispatch();

  useEffect(() => {
    // In a real app, we would request camera permissions here
    // For this demo, we'll simulate having permissions
    setHasPermission(true);
    
    // Initialize privacy service
    privacyService.initNSFWModel();
    
    // If in quick share mode, pre-select the first group
    if (quickShareMode && friendGroups.length > 0) {
      setSelectedGroups([friendGroups[0].id]);
    }
  }, [quickShareMode, friendGroups]);
  
  // Generate AI caption suggestions when image is captured
  useEffect(() => {
    if (capturedImage) {
      generateAiSuggestions();
      scanImageContent();
    }
  }, [capturedImage]);
  
  const generateAiSuggestions = () => {
    // In a real app, we would use AI to generate caption suggestions
    // For this demo, we'll use predefined suggestions
    const suggestions = [
      "Beautiful day outside! 🌞",
      "Just captured this amazing moment ✨",
      "Can't believe what I'm seeing right now!",
      "This view is everything 😍",
      "No filter needed for this one"
    ];
    
    setAiSuggestions(suggestions);
  };
  
  const scanImageContent = async () => {
    if (!enableContentScan || !capturedImage) return;
    
    try {
      // Scan image for sensitive content
      const result = await privacyService.scanImage(capturedImage);
      setScanResult(result);
      
      // Show warning if sensitive content detected
      if (result.isSensitive) {
        Alert.alert(
          'Content Warning',
          'This image may contain sensitive content. It will be marked with a content warning if shared.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error scanning image:', error);
    }
  };
  
  const handleApplySuggestion = (suggestion) => {
    setCaption(suggestion);
    setShowAiSuggestions(false);
  };

  const handleCapture = async () => {
    if (capturing) return;
    
    setCapturing(true);
    
    try {
      // In a real app, we would use the camera to take a photo
      // For this demo, we'll use a placeholder image
      setCapturedImage('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&h=300');
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    } finally {
      setCapturing(false);
    }
  };

  const handleFlipCamera = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const handleToggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCaption('');
    setSelectedGroups([]);
  };

  const handleSelectGroup = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleShare = async () => {
    if (selectedGroups.length === 0) {
      Alert.alert('Error', 'Please select at least one group to share with');
      return;
    }
    
    setUploading(true);
    
    try {
      // In a real app, we would upload the image to Firebase Storage
      // and create a document in Firestore
      // For this demo, we'll simulate the upload
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get all recipient IDs from selected groups
      const allRecipients = new Set();
      selectedGroups.forEach(groupId => {
        const group = friendGroups.find(g => g.id === groupId);
        if (group && group.memberIds) {
          group.memberIds.forEach(id => allRecipients.add(id));
        }
      });
      
      const recipientIds = Array.from(allRecipients);
      
      // Create snap object
      let newSnap = {
        id: `snap-${Date.now()}`,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhotoURL: user.photoURL,
        imageUrl: capturedImage,
        caption,
        timestamp: new Date().toISOString(),
        recipientIds,
        groupIds: selectedGroups,
        autoPrivate: true,
        reactions: []
      };
      
      // Apply content warning if sensitive content detected
      if (scanResult?.isSensitive) {
        await privacyService.applyContentWarning(newSnap.id, scanResult);
        newSnap.hasSensitiveContent = true;
        newSnap.contentWarningLevel = scanResult.confidence > 0.9 ? 'high' : 'medium';
      }
      
      // Apply end-to-end encryption if enabled
      if (enableEncryption) {
        newSnap = await privacyService.encryptSnapshot(newSnap, recipientIds);
      }
      
      // Add to Redux store
      dispatch(addSnap(newSnap));
      
      // Navigate back to home screen
      navigation.navigate('Home');
      
      // Show success message
      Alert.alert('Success', 'Your snap has been shared!');
    } catch (error) {
      console.error('Error sharing snap:', error);
      Alert.alert('Error', 'Failed to share snap');
    } finally {
      setUploading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        // Camera View
        <View style={styles.cameraContainer}>
          {/* This would be a real camera component in a complete app */}
          <View style={styles.cameraMockup}>
            <Text style={styles.cameraMockupText}>Camera Preview</Text>
            {capturing && (
              <ActivityIndicator size="large" color="#FFFFFF" />
            )}
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera}>
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={handleCapture}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash}>
              <Text style={styles.controlIcon}>{flash === 'on' ? '⚡' : '🔦'}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Preview View
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          
          <View style={styles.previewControls}>
            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption..."
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={150}
              />
              
              <TouchableOpacity 
                style={styles.aiSuggestButton}
                onPress={() => setShowAiSuggestions(!showAiSuggestions)}
              >
                <Text style={styles.aiSuggestButtonText}>AI</Text>
              </TouchableOpacity>
            </View>
            
            {showAiSuggestions && (
              <ScrollView 
                horizontal 
                style={styles.suggestionsContainer}
                showsHorizontalScrollIndicator={false}
              >
                {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleApplySuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.groupButton}
              onPress={() => setShowGroupModal(true)}
            >
              <Text style={styles.groupButtonText}>
                {selectedGroups.length > 0 
                  ? `${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''} selected`
                  : 'Select Groups'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.privacySettings}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>End-to-end encryption</Text>
                <Switch
                  value={enableEncryption}
                  onValueChange={setEnableEncryption}
                  trackColor={{ false: '#767577', true: '#7C4DFF' }}
                  thumbColor={enableEncryption ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Content scanning</Text>
                <Switch
                  value={enableContentScan}
                  onValueChange={setEnableContentScan}
                  trackColor={{ false: '#767577', true: '#7C4DFF' }}
                  thumbColor={enableContentScan ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={handleRetake}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={handleShare}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.shareButtonText}>Share</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Groups</Text>
            
            <ScrollView style={styles.groupList}>
              {friendGroups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupItem,
                    selectedGroups.includes(group.id) && styles.selectedGroupItem
                  ]}
                  onPress={() => handleSelectGroup(group.id)}
                >
                  <View style={[styles.groupColorIndicator, { backgroundColor: group.color }]} />
                  <Text style={styles.groupName}>{group.name}</Text>
                  {selectedGroups.includes(group.id) && (
                    <Text style={styles.selectedIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowGroupModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraMockup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  cameraMockupText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  captionInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  aiSuggestButton: {
    backgroundColor: '#7C4DFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSuggestButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionItem: {
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  privacySettings: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  groupButton: {
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  groupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  retakeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#7C4DFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  groupList: {
    maxHeight: 300,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedGroupItem: {
    backgroundColor: '#F0EAFF',
  },
  groupColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  selectedIcon: {
    color: '#7C4DFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;
