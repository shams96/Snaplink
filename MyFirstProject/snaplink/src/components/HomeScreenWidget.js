import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const HomeScreenWidget = ({ snaps = [] }) => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const friendGroups = useSelector(state => state.user.friendGroups);
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const snapTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - snapTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleSnapPress = (snap) => {
    // Navigate to snap detail or expand snap
    console.log('Snap pressed:', snap.id);
  };
  
  const handleQuickShare = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to share snaps');
      return;
    }
    
    if (friendGroups.length === 0) {
      Alert.alert('No Friend Groups', 'Create a friend group first to share snaps');
      return;
    }
    
    // Navigate to camera with quick share mode enabled
    navigation.navigate('Camera', { quickShareMode: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>Recent Snaps</Text>
        <TouchableOpacity 
          style={styles.quickShareButton}
          onPress={handleQuickShare}
        >
          <Text style={styles.quickShareButtonText}>Quick Share</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.widgetGrid}>
        {snaps.length > 0 ? (
          snaps.map(snap => (
            <TouchableOpacity
              key={snap.id}
              style={styles.snapItem}
              onPress={() => handleSnapPress(snap)}
            >
              <Image
                source={{ uri: snap.thumbnailUrl }}
                style={styles.snapImage}
                resizeMode="cover"
              />
              <View style={styles.snapInfo}>
                <Text style={styles.senderName}>{snap.senderName}</Text>
                <Text style={styles.timestamp}>{formatTimeAgo(snap.timestamp)}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent snaps</Text>
            <Text style={styles.emptySubtext}>Snaps from friends will appear here</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  quickShareButton: {
    backgroundColor: '#7C4DFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickShareButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  snapItem: {
    width: '50%',
    aspectRatio: 1,
    padding: 4,
  },
  snapImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  snapInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    padding: 4,
  },
  senderName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.8,
  },
  emptyContainer: {
    width: '100%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
});

export default HomeScreenWidget;
