import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { firestore } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { setFriendGroups } from '../redux/userSlice';

const FriendsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  
  const user = useSelector(state => state.user.user);
  const friendGroups = useSelector(state => state.user.friendGroups);
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchGroups();
    }
  }, [user]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch the user's friends from Firestore
      // For now, we'll use dummy data
      const dummyFriends = [
        { id: '1', name: 'Alex Johnson', email: 'alex@example.com', photoURL: 'https://api.dicebear.com/6.x/personas/svg?seed=Alex' },
        { id: '2', name: 'Sarah Kim', email: 'sarah@example.com', photoURL: 'https://api.dicebear.com/6.x/personas/svg?seed=Sarah' },
        { id: '3', name: 'Miguel Rodriguez', email: 'miguel@example.com', photoURL: 'https://api.dicebear.com/6.x/personas/svg?seed=Miguel' },
        { id: '4', name: 'Priya Patel', email: 'priya@example.com', photoURL: 'https://api.dicebear.com/6.x/personas/svg?seed=Priya' },
      ];
      
      setFriends(dummyFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      // In a real app, you would fetch the user's friend groups from Firestore
      // For now, we'll use dummy data
      const dummyGroups = [
        { id: '1', name: 'Best Friends', memberIds: ['1', '2'], color: '#FF6B6B' },
        { id: '2', name: 'Work Buddies', memberIds: ['3', '4'], color: '#4ECDC4' },
        { id: '3', name: 'Family', memberIds: ['2'], color: '#FFD166' },
      ];
      
      setGroups(dummyGroups);
      dispatch(setFriendGroups(dummyGroups));
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleAddFriend = () => {
    Alert.alert('Coming Soon', 'Friend requests will be available in the next update!');
  };

  const handleCreateGroup = () => {
    Alert.alert('Coming Soon', 'Group creation will be available in the next update!');
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Image
        source={{ uri: item.photoURL }}
        style={styles.friendAvatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroupItem = ({ item }) => {
    const memberCount = item.memberIds.length;
    
    return (
      <TouchableOpacity style={styles.groupItem}>
        <View style={[styles.groupColorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupMemberCount}>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>
        <Text style={styles.groupActionText}>Edit</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends or groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
        </View>
      ) : (
        <>
          {activeTab === 'friends' ? (
            <>
              <FlatList
                data={friends.filter(friend => 
                  friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  friend.email.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                renderItem={renderFriendItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No friends found</Text>
                    <Text style={styles.emptySubtext}>Add friends to start sharing snaps!</Text>
                  </View>
                }
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                <Text style={styles.addButtonText}>Add Friend</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <FlatList
                data={groups.filter(group => 
                  group.name.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                renderItem={renderGroupItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No groups found</Text>
                    <Text style={styles.emptySubtext}>Create groups to organize your friends!</Text>
                  </View>
                }
              />
              <TouchableOpacity style={styles.addButton} onPress={handleCreateGroup}>
                <Text style={styles.addButtonText}>Create Group</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7C4DFF',
  },
  tabText: {
    fontSize: 16,
    color: '#888888',
  },
  activeTabText: {
    color: '#7C4DFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#888888',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0EAFF',
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#7C4DFF',
    fontSize: 12,
    fontWeight: '500',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  groupColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  groupMemberCount: {
    fontSize: 14,
    color: '#888888',
  },
  groupActionText: {
    color: '#7C4DFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FriendsScreen;
