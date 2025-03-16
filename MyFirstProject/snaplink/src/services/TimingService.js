import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';

class TimingService {
  constructor(userId) {
    this.userId = userId;
  }

  async getUserPreferredWindows() {
    const userDoc = await getDoc(doc(firestore, 'users', this.userId));
    if (!userDoc.exists()) {
      return [];
    }
    return userDoc.data().preferredTimeWindows || [];
  }

  async recordUserActivity() {
    await addDoc(collection(firestore, 'userActivity'), {
      userId: this.userId,
      timestamp: serverTimestamp(),
      action: 'app_open'
    });
  }

  async calculateOptimalTimes() {
    const userRef = await getDoc(doc(firestore, 'users', this.userId));
    if (!userRef.exists()) {
      return [18, 19, 20]; // Default hours if user not found
    }
    
    const friendIds = userRef.data().friends || [];
    if (friendIds.length === 0) {
      return [18, 19, 20]; // Default hours if no friends
    }

    const activityQuery = query(
      collection(firestore, 'userActivity'),
      where('userId', 'in', friendIds),
      orderBy('timestamp', 'desc'),
      limit(500)
    );
    
    const activitySnapshot = await getDocs(activityQuery);

    const hourCounts = new Array(24).fill(0);

    activitySnapshot.forEach(doc => {
      const timestamp = doc.data().timestamp;
      if (timestamp) {
        const hour = timestamp.toDate().getHours();
        hourCounts[hour]++;
      }
    });

    const topHours = [];
    for (let i = 0; i < 3; i++) {
      const maxIndex = hourCounts.indexOf(Math.max(...hourCounts));
      if (hourCounts[maxIndex] > 0) {
        topHours.push(maxIndex);
        hourCounts[maxIndex] = -1;
      } else {
        // If no more positive counts, add default hours
        if (i === 0) topHours.push(18);
        else if (i === 1) topHours.push(19);
        else topHours.push(20);
      }
    }

    return topHours;
  }

  async scheduleNotification() {
    const preferredWindows = await this.getUserPreferredWindows();
    const optimalHours = await this.calculateOptimalTimes();

    let selectedHour = null;
    for (const hour of optimalHours) {
      for (const window of preferredWindows) {
        const [start, end] = window.split('-').map(t => parseInt(t.split(':')[0]));
        if (hour >= start && hour <= end) {
          selectedHour = hour;
          break;
        }
      }
      if (selectedHour !== null) break;
    }

    if (selectedHour === null && optimalHours.length > 0) {
      selectedHour = optimalHours[0];
    }

    if (selectedHour === null) {
      selectedHour = 18; // Default to 6 PM
    }

    return {
      scheduledHour: selectedHour,
      scheduledDate: new Date().setHours(selectedHour, 0, 0, 0)
    };
  }
}

export default TimingService;
