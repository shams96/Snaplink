import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { auth, firestore } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logout, updatePrivacySettings } from '../redux/userSlice';

const ProfileScreen = ({ navigation }) => {
  const user = useSelector(state => state.user.user);
  const privacySettings = useSelector(state => state.user.privacySettings);
  const [autoPrivate, setAutoPrivate] = useState(privacySettings?.autoPrivateMode || true);
  const [streakCount, setStreakCount] = useState(0);
  const [totalSnaps, setTotalSnaps] = useState(0);
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStreakCount(userData.streakCount || 0);
        setTotalSnaps(userData.totalSnaps || 0);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleToggleAutoPrivate = async (value) => {
    setAutoPrivate(value);
    
    try {
      // Update in Firestore
      await updateDoc(doc(firestore, 'users', user.uid), {
        'privacySettings.autoPrivateMode': value
      });
      
      // Update in Redux
      dispatch(updatePrivacySettings({ autoPrivateMode: value }));
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
      // Revert the switch if update fails
      setAutoPrivate(!value);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing will be available in the next update!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ 
            uri: user?.photoURL || 
                 `https://api.dicebear.com/6.x/personas/svg?seed=${user?.uid}` 
          }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streakCount}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalSnaps}</Text>
          <Text style={styles.statLabel}>Total Snaps</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Auto-Private Mode</Text>
            <Text style={styles.settingDescription}>
              Automatically make snaps disappear after 24 hours
            </Text>
          </View>
          <Switch
            value={autoPrivate}
            onValueChange={handleToggleAutoPrivate}
            trackColor={{ false: '#D1D1D6', true: '#A794FF' }}
            thumbColor={autoPrivate ? '#7C4DFF' : '#F4F3F4'}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available in the next update!')}
        >
          <Text style={styles.settingButtonText}>Manage Time Windows</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available in the next update!')}
        >
          <Text style={styles.settingButtonText}>Data & Privacy</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available in the next update!')}
        >
          <Text style={styles.settingButtonText}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available in the next update!')}
        >
          <Text style={styles.settingButtonText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.settingButtonText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7C4DFF',
  },
  editButtonText: {
    color: '#7C4DFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#888888',
    maxWidth: '80%',
  },
  settingButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF6B6B',
  },
});

export default ProfileScreen;
