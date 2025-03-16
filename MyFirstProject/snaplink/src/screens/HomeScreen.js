import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { firestore } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { setSnaps, setRecentSnaps, setDailyChallenge } from '../redux/snapsSlice';
import { setPreferredTimeWindows } from '../redux/userSlice';
import HomeScreenWidget from '../components/HomeScreenWidget';
import DailyChallenge from '../components/DailyChallenge';
import SnapCard from '../components/SnapCard';
import FloatingActionButton from '../components/FloatingActionButton';
import TimingService from '../services/TimingService';
import { colors } from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector(state => state.user.user);
  const snaps = useSelector(state => state.snaps.snaps);
  const recentSnaps = useSelector(state => state.snaps.recentSnaps);
  const dailyChallenge = useSelector(state => state.snaps.dailyChallenge);
  
  const dispatch = useDispatch();

  // Sample daily challenges
  const challenges = [
    "What's your workspace looking like today?",
    "Show us your favorite spot at home!",
    "What are you having for lunch?",
    "Share your current view!",
    "What's making you smile today?"
  ];

  useEffect(() => {
    if (user) {
      fetchData();
      initTimingService();
    }
  }, [user]);

  const initTimingService = async () => {
    try {
      const timingService = new TimingService(user.uid);
      
      // Record user activity
      await timingService.recordUserActivity();
      
      // Get user's preferred time windows
      const preferredWindows = await timingService.getUserPreferredWindows();
      dispatch(setPreferredTimeWindows(preferredWindows));
      
      // Calculate optimal posting times
      const optimalTimes = await timingService.calculateOptimalTimes();
      console.log('Optimal posting times:', optimalTimes);
      
      // Schedule notification for optimal time
      const scheduledTime = await timingService.scheduleNotification();
      console.log('Scheduled notification for:', new Date(scheduledTime.scheduledDate).toLocaleTimeString());
    } catch (error) {
      console.error('Error initializing timing service:', error);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's friend groups
      const groupsQuery = query(
        collection(firestore, 'friendGroups'),
        where('memberIds', 'array-contains', user.uid)
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupIds = groupsSnapshot.docs.map(doc => doc.id);
      
      // Fetch recent snaps
      const snapsQuery = query(
        collection(firestore, 'snaps'),
        where('recipientIds', 'array-contains', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapsSnapshot = await getDocs(snapsQuery);
      
      const snapsData = snapsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString()
      }));
      
      dispatch(setSnaps(snapsData));
      
      // Set recent snaps for widget
      const recentSnapsData = snapsData.slice(0, 4).map(snap => ({
        id: snap.id,
        thumbnailUrl: snap.imageUrl,
        senderName: snap.senderName || 'Friend',
        timestamp: snap.timestamp
      }));
      
      dispatch(setRecentSnaps(recentSnapsData));
      
      // Set random daily challenge
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      dispatch(setDailyChallenge(randomChallenge));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C4DFF" />
      </View>
    );
  }

  const handleInvitePress = () => {
    navigation.navigate('Invite');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#7C4DFF"]} />
        }
      >
        {/* Invite Banner */}
        <View style={styles.inviteBanner}>
          <View style={styles.inviteBannerContent}>
            <Text style={styles.inviteBannerTitle}>Invite Friends</Text>
            <Text style={styles.inviteBannerText}>
              SnapLink is better with friends! Invite your friends to join.
            </Text>
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={handleInvitePress}
            >
              <Text style={styles.inviteButtonText}>Invite Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Live Widgets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Widgets</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          <HomeScreenWidget snaps={recentSnaps} />
        </View>
        
        {/* Daily Challenge */}
        {dailyChallenge && (
          <View style={styles.section}>
            <DailyChallenge challenge={dailyChallenge} onRespond={handleCameraPress} />
          </View>
        )}
        
        {/* Recent Snaps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Snaps</Text>
          </View>
          
          {snaps.length > 0 ? (
            snaps.map(snap => (
              <SnapCard key={snap.id} snap={snap} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No snaps yet. Share your first snap!</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <FloatingActionButton onPress={handleCameraPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionAction: {
    fontSize: 18,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 10,
  },
  emptyStateText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
  // Added styles for invite banner
  inviteBanner: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  inviteBannerContent: {
    padding: 16,
  },
  inviteBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 8,
  },
  inviteBannerText: {
    fontSize: 14,
    color: '#4A148C',
    marginBottom: 12,
  },
  inviteButton: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HomeScreen;
