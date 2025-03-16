import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
  Clipboard,
  Platform
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaContainer, Button, ButtonVariant } from '../components/common';
import GrowthService from '../services/GrowthService';
import { useNetworkState } from '../utils/errorHandling';
import theme from '../styles/theme';

const InviteScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingInvites, setRemainingInvites] = useState(0);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [inviteNetwork, setInviteNetwork] = useState({ invitedBy: null, invited: [] });
  const [waitlistEmail, setWaitlistEmail] = useState('');
  
  const user = useSelector(state => state.user.user);
  const { isConnected } = useNetworkState();
  
  // Load user's invite data
  useEffect(() => {
    const loadInviteData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get remaining invites
        const remaining = await GrowthService.getRemainingInvites(user.uid);
        setRemainingInvites(remaining);
        
        // Get invite network
        const network = await GrowthService.getInviteNetwork(user.uid);
        setInviteNetwork(network);
        
        // Get active invite codes (in a real app, we would fetch these from Firestore)
        // For this demo, we'll just show a placeholder
        setInviteCodes([
          { code: 'SNAP1234', createdAt: new Date().toISOString() }
        ]);
      } catch (error) {
        console.error('Error loading invite data:', error);
        Alert.alert('Error', 'Failed to load invite data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInviteData();
  }, [user]);
  
  // Generate a new invite code
  const handleGenerateInvite = async () => {
    if (!isConnected) {
      Alert.alert('No Connection', 'You need an internet connection to generate invites.');
      return;
    }
    
    if (remainingInvites <= 0) {
      Alert.alert('No Invites Left', 'You have used all your available invites.');
      return;
    }
    
    setGenerating(true);
    try {
      const code = await GrowthService.generateInviteCode(user.uid);
      if (code) {
        // Add the new code to the list
        setInviteCodes([
          { code, createdAt: new Date().toISOString() },
          ...inviteCodes
        ]);
        
        // Update remaining invites
        setRemainingInvites(remainingInvites - 1);
        
        // Show success message
        Alert.alert('Success', 'Invite code generated successfully!');
      }
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } finally {
      setGenerating(false);
    }
  };
  
  // Share an invite code
  const handleShareInvite = async (code) => {
    try {
      const appUrl = Platform.select({
        ios: 'https://apps.apple.com/app/snaplink/id1234567890',
        android: 'https://play.google.com/store/apps/details?id=io.snaplink.app',
        default: 'https://snaplink.app'
      });
      
      await Share.share({
        message: `Join me on SnapLink, a new way to share authentic moments with friends! Use my invite code: ${code}\n\nDownload the app: ${appUrl}`
      });
    } catch (error) {
      console.error('Error sharing invite code:', error);
    }
  };
  
  // Copy invite code to clipboard
  const handleCopyInvite = (code) => {
    Clipboard.setString(code);
    Alert.alert('Copied', 'Invite code copied to clipboard!');
  };
  
  // Add someone to the waitlist
  const handleAddToWaitlist = async () => {
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    setSubmitting(true);
    try {
      const success = await GrowthService.addToWaitlist(waitlistEmail, user.uid);
      if (success) {
        setWaitlistEmail('');
        Alert.alert('Success', 'Your friend has been added to the waitlist!');
      } else {
        Alert.alert('Already on Waitlist', 'This email is already on the waitlist.');
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      Alert.alert('Error', 'Failed to add to waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <SafeAreaContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaContainer>
    );
  }
  
  return (
    <SafeAreaContainer style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Invite Friends</Text>
          <Text style={styles.subtitle}>
            Share SnapLink with your friends and build your network!
          </Text>
        </View>
        
        {/* Remaining Invites */}
        <View style={styles.inviteCountContainer}>
          <Text style={styles.inviteCountLabel}>Remaining Invites</Text>
          <Text style={styles.inviteCount}>{remainingInvites}</Text>
          <Text style={styles.inviteCountDescription}>
            SnapLink is currently invite-only. Each user gets {GrowthService.MAX_INVITES_PER_USER} invites to share with friends.
          </Text>
        </View>
        
        {/* Generate Invite Button */}
        <Button
          title={generating ? "Generating..." : "Generate New Invite Code"}
          onPress={handleGenerateInvite}
          disabled={generating || remainingInvites <= 0}
          loading={generating}
          style={styles.generateButton}
        />
        
        {/* Active Invite Codes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Invite Codes</Text>
          
          {inviteCodes.length === 0 ? (
            <Text style={styles.emptyText}>
              You haven't generated any invite codes yet.
            </Text>
          ) : (
            inviteCodes.map((invite, index) => (
              <View key={index} style={styles.inviteCodeContainer}>
                <View style={styles.inviteCodeInfo}>
                  <Text style={styles.inviteCode}>{invite.code}</Text>
                  <Text style={styles.inviteDate}>
                    Created {new Date(invite.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    style={styles.inviteAction}
                    onPress={() => handleCopyInvite(invite.code)}
                  >
                    <Text style={styles.inviteActionText}>Copy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.inviteAction, styles.inviteActionShare]}
                    onPress={() => handleShareInvite(invite.code)}
                  >
                    <Text style={styles.inviteActionTextShare}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        
        {/* Invite Network */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Invite Network</Text>
          
          {/* Who invited you */}
          <View style={styles.networkItem}>
            <Text style={styles.networkLabel}>Invited By:</Text>
            <Text style={styles.networkValue}>
              {inviteNetwork.invitedBy ? 'User ID: ' + inviteNetwork.invitedBy : 'No one (Early Adopter)'}
            </Text>
          </View>
          
          {/* Who you invited */}
          <View style={styles.networkItem}>
            <Text style={styles.networkLabel}>You've Invited:</Text>
            <Text style={styles.networkValue}>
              {inviteNetwork.invited.length > 0 
                ? `${inviteNetwork.invited.length} friends`
                : 'No one yet'}
            </Text>
          </View>
        </View>
        
        {/* Waitlist */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Add Friends to Waitlist</Text>
          <Text style={styles.sectionDescription}>
            Don't have any invites left? Add your friends to the waitlist and they'll be notified when more invites become available.
          </Text>
          
          <View style={styles.waitlistForm}>
            <TextInput
              style={styles.waitlistInput}
              placeholder="Friend's Email"
              value={waitlistEmail}
              onChangeText={setWaitlistEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Button
              title={submitting ? "Adding..." : "Add to Waitlist"}
              variant={ButtonVariant.SECONDARY}
              onPress={handleAddToWaitlist}
              disabled={submitting || !waitlistEmail}
              loading={submitting}
              style={styles.waitlistButton}
            />
          </View>
        </View>
        
        {/* Viral Growth Tips */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Grow Your Network</Text>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>🔥 Share on Social Media</Text>
            <Text style={styles.tipText}>
              Post about SnapLink on your social media accounts to find friends who are already using the app.
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>👥 Invite Your Close Friends First</Text>
            <Text style={styles.tipText}>
              SnapLink is best with friends! Start by inviting your closest friends to build your initial network.
            </Text>
          </View>
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>🏆 Participate in Daily Challenges</Text>
            <Text style={styles.tipText}>
              Join the daily challenges to get your snaps featured and grow your visibility within the community.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  inviteCountContainer: {
    backgroundColor: theme.colors.primary + '10', // 10% opacity
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  inviteCountLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  inviteCount: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
  inviteCountDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  generateButton: {
    marginBottom: theme.spacing.lg,
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  inviteCodeContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  inviteCodeInfo: {
    marginBottom: theme.spacing.sm,
  },
  inviteCode: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: 1,
  },
  inviteDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: 'row',
  },
  inviteAction: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.xs,
  },
  inviteActionShare: {
    backgroundColor: theme.colors.primary,
  },
  inviteActionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  inviteActionTextShare: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  networkItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  networkLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    width: 100,
  },
  networkValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  waitlistForm: {
    marginTop: theme.spacing.sm,
  },
  waitlistInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  waitlistButton: {
    marginBottom: theme.spacing.sm,
  },
  tipContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default InviteScreen;
