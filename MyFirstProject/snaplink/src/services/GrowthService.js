import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { tryCatch, ErrorTypes } from '../utils/errorHandling';

/**
 * GrowthService handles viral growth features like invites, challenges, and waitlists
 */
class GrowthService {
  constructor() {
    this.invitesCollection = 'invites';
    this.waitlistCollection = 'waitlist';
    this.challengesCollection = 'challenges';
    this.featuredCollection = 'featured';
    this.MAX_INVITES_PER_USER = 3;
    this.DAILY_INVITE_LIMIT = 1000; // Can be adjusted based on growth targets
  }

  /**
   * Generate a unique invite code for a user
   * @param {string} userId - The user ID
   * @returns {Promise<string>} The generated invite code
   */
  async generateInviteCode(userId) {
    return tryCatch(async () => {
      // Generate a random 8-character code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Store the code in Firestore
      const inviteRef = doc(firestore, this.invitesCollection, code);
      await setDoc(inviteRef, {
        createdBy: userId,
        createdAt: serverTimestamp(),
        used: false,
        usedBy: null,
        usedAt: null
      });
      
      // Update user's remaining invites count
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        remainingInvites: increment(-1)
      });
      
      return code;
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to generate invite code',
      fallbackValue: null,
      rethrow: true
    });
  }

  /**
   * Check if an invite code is valid
   * @param {string} code - The invite code to check
   * @returns {Promise<boolean>} Whether the code is valid
   */
  async isInviteCodeValid(code) {
    return tryCatch(async () => {
      const inviteRef = doc(firestore, this.invitesCollection, code);
      const inviteSnap = await getDoc(inviteRef);
      
      if (!inviteSnap.exists()) {
        return false;
      }
      
      const inviteData = inviteSnap.data();
      return !inviteData.used;
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to check invite code',
      fallbackValue: false
    });
  }

  /**
   * Redeem an invite code
   * @param {string} code - The invite code to redeem
   * @param {string} userId - The user ID redeeming the code
   * @returns {Promise<boolean>} Whether the code was successfully redeemed
   */
  async redeemInviteCode(code, userId) {
    return tryCatch(async () => {
      // Check if code is valid
      const isValid = await this.isInviteCodeValid(code);
      if (!isValid) {
        return false;
      }
      
      // Mark code as used
      const inviteRef = doc(firestore, this.invitesCollection, code);
      await updateDoc(inviteRef, {
        used: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      });
      
      // Give the new user their initial invites
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        remainingInvites: this.MAX_INVITES_PER_USER,
        invitedBy: (await getDoc(inviteRef)).data().createdBy
      });
      
      return true;
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to redeem invite code',
      fallbackValue: false
    });
  }

  /**
   * Get the number of remaining invites for a user
   * @param {string} userId - The user ID
   * @returns {Promise<number>} The number of remaining invites
   */
  async getRemainingInvites(userId) {
    return tryCatch(async () => {
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return 0;
      }
      
      return userSnap.data().remainingInvites || 0;
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to get remaining invites',
      fallbackValue: 0
    });
  }

  /**
   * Add a user to the waitlist
   * @param {string} email - The user's email
   * @param {string} referredBy - The user ID who referred them (optional)
   * @returns {Promise<boolean>} Whether the user was successfully added to the waitlist
   */
  async addToWaitlist(email, referredBy = null) {
    return tryCatch(async () => {
      // Check if email is already on waitlist
      const waitlistQuery = query(
        collection(firestore, this.waitlistCollection),
        where('email', '==', email),
        limit(1)
      );
      
      const waitlistSnap = await getDocs(waitlistQuery);
      if (!waitlistSnap.empty) {
        return false; // Already on waitlist
      }
      
      // Add to waitlist
      const waitlistRef = doc(collection(firestore, this.waitlistCollection));
      await setDoc(waitlistRef, {
        email,
        referredBy,
        joinedAt: serverTimestamp(),
        invited: false,
        invitedAt: null
      });
      
      return true;
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to add to waitlist',
      fallbackValue: false
    });
  }

  /**
   * Get the current daily challenge
   * @returns {Promise<Object>} The current daily challenge
   */
  async getCurrentChallenge() {
    return tryCatch(async () => {
      const today = new Date();
      const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      
      const challengeRef = doc(firestore, this.challengesCollection, dateString);
      const challengeSnap = await getDoc(challengeRef);
      
      if (!challengeSnap.exists()) {
        // Return default challenge if none exists for today
        return {
          id: dateString,
          title: "What's your workspace looking like today?",
          description: "Share a snap of your current workspace!",
          hashtag: "#WorkspaceWednesday",
          expiresAt: new Date(today.setHours(23, 59, 59, 999)).toISOString()
        };
      }
      
      return {
        id: challengeSnap.id,
        ...challengeSnap.data()
      };
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to get current challenge',
      fallbackValue: {
        id: 'default',
        title: "What's your workspace looking like today?",
        description: "Share a snap of your current workspace!",
        hashtag: "#WorkspaceWednesday",
        expiresAt: new Date().toISOString()
      }
    });
  }

  /**
   * Submit a snap for the daily challenge
   * @param {string} snapId - The ID of the snap
   * @param {string} challengeId - The ID of the challenge
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} Whether the submission was successful
   */
  async submitChallengeEntry(snapId, challengeId, userId) {
    return tryCatch(async () => {
      const entryRef = doc(collection(firestore, `${this.challengesCollection}/${challengeId}/entries`));
      await setDoc(entryRef, {
        snapId,
        userId,
        submittedAt: serverTimestamp(),
        featured: false
      });
      
      return true;
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to submit challenge entry',
      fallbackValue: false
    });
  }

  /**
   * Get featured snaps for the current challenge
   * @param {string} challengeId - The ID of the challenge
   * @param {number} limit - The maximum number of featured snaps to return
   * @returns {Promise<Array>} The featured snaps
   */
  async getFeaturedSnaps(challengeId, limit = 10) {
    return tryCatch(async () => {
      const featuredQuery = query(
        collection(firestore, `${this.challengesCollection}/${challengeId}/entries`),
        where('featured', '==', true),
        limit
      );
      
      const featuredSnap = await getDocs(featuredQuery);
      return featuredSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to get featured snaps',
      fallbackValue: []
    });
  }

  /**
   * Get the user's invite network (who they invited and who invited them)
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The user's invite network
   */
  async getInviteNetwork(userId) {
    return tryCatch(async () => {
      // Get who invited this user
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      const invitedBy = userSnap.exists() ? userSnap.data().invitedBy : null;
      
      // Get who this user invited
      const invitesQuery = query(
        collection(firestore, this.invitesCollection),
        where('createdBy', '==', userId),
        where('used', '==', true)
      );
      
      const invitesSnap = await getDocs(invitesQuery);
      const invited = invitesSnap.docs.map(doc => doc.data().usedBy);
      
      return {
        invitedBy,
        invited
      };
    }, {
      errorType: ErrorTypes.SERVER,
      errorMessage: 'Failed to get invite network',
      fallbackValue: { invitedBy: null, invited: [] }
    });
  }
}

export default new GrowthService();
