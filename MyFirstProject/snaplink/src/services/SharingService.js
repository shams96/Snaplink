import { firestore, storage } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

class SharingService {
  async getFriendGroups(userId) {
    const groupsQuery = query(
      collection(firestore, 'friendGroups'),
      where('ownerId', '==', userId)
    );
    
    const groupsSnapshot = await getDocs(groupsQuery);
    
    const groups = [];
    groupsSnapshot.forEach(doc => {
      groups.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return groups;
  }

  async createFriendGroup(userId, groupName, memberIds, color = '#7C4DFF') {
    const newGroup = {
      ownerId: userId,
      name: groupName,
      memberIds,
      color,
      createdAt: serverTimestamp()
    };

    const groupRef = await addDoc(collection(firestore, 'friendGroups'), newGroup);
    return {
      id: groupRef.id,
      ...newGroup,
      createdAt: new Date().toISOString() // Convert for immediate use
    };
  }

  async shareSnap(userId, imageUri, caption, groupIds, autoPrivate = false) {
    try {
      // Generate a unique filename
      const filename = `${userId}_${new Date().getTime()}.jpg`;
      const storageRef = ref(storage, `snaps/${filename}`);

      // For a real app, we would upload the image to Firebase Storage
      // For this demo, we'll use the provided imageUri directly
      let downloadUrl = imageUri;
      
      // If imageUri is a local file URI (starts with file://), we would upload it
      if (imageUri.startsWith('file://')) {
        // In a real app, we would do:
        // const response = await fetch(imageUri);
        // const blob = await response.blob();
        // await uploadBytes(storageRef, blob);
        // downloadUrl = await getDownloadURL(storageRef);
        
        // For demo purposes, use a placeholder image
        downloadUrl = 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&h=300';
      }

      // Get all recipient IDs from selected groups
      let allRecipients = new Set();
      for (const groupId of groupIds) {
        const groupDoc = await getDoc(doc(firestore, 'friendGroups', groupId));
        if (groupDoc.exists()) {
          const members = groupDoc.data().memberIds || [];
          members.forEach(id => allRecipients.add(id));
        }
      }

      const recipientIds = Array.from(allRecipients);
      
      // Calculate expiration date if auto-private is enabled
      const expirationDate = autoPrivate
        ? new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
        : null;

      // Create snap data
      const snapData = {
        senderId: userId,
        recipientIds,
        imageUrl: downloadUrl,
        caption,
        timestamp: serverTimestamp(),
        autoPrivate,
        expiresAt: expirationDate,
        groupIds
      };

      // Add to Firestore
      const snapRef = await addDoc(collection(firestore, 'snaps'), snapData);
      
      // Return the created snap with ID
      return {
        id: snapRef.id,
        ...snapData,
        timestamp: new Date().toISOString() // Convert for immediate use
      };
    } catch (error) {
      console.error('Error sharing snap:', error);
      throw error;
    }
  }
  
  async getSnapsForUser(userId, limit = 10) {
    try {
      const snapsQuery = query(
        collection(firestore, 'snaps'),
        where('recipientIds', 'array-contains', userId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapsSnapshot = await getDocs(snapsQuery);
      
      const snaps = [];
      snapsSnapshot.forEach(doc => {
        const data = doc.data();
        snaps.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate().toISOString()
        });
      });
      
      return snaps;
    } catch (error) {
      console.error('Error getting snaps:', error);
      throw error;
    }
  }
}

export default SharingService;
