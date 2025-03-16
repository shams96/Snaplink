import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import GrowthService from '../services/GrowthService';
import theme from '../styles/theme';
import { ResponsiveImage } from './common';

const DailyChallenge = ({ onRespond }) => {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [featuredSnaps, setFeaturedSnaps] = useState([]);
  const [showFeatured, setShowFeatured] = useState(false);
  
  const user = useSelector(state => state.user.user);
  
  // Load the current daily challenge
  useEffect(() => {
    const loadChallenge = async () => {
      setLoading(true);
      try {
        // Get current challenge
        const currentChallenge = await GrowthService.getCurrentChallenge();
        setChallenge(currentChallenge);
        
        // Get featured snaps for this challenge
        const featured = await GrowthService.getFeaturedSnaps(currentChallenge.id, 3);
        setFeaturedSnaps(featured);
      } catch (error) {
        console.error('Error loading daily challenge:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChallenge();
  }, []);
  
  // Handle respond button press
  const handleRespond = () => {
    if (onRespond && challenge) {
      onRespond(challenge);
    }
  };
  
  // Toggle featured snaps visibility
  const toggleFeatured = () => {
    setShowFeatured(!showFeatured);
  };
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }
  
  // Render challenge
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Challenge</Text>
          {featuredSnaps.length > 0 && (
            <TouchableOpacity onPress={toggleFeatured}>
              <Text style={styles.featuredToggle}>
                {showFeatured ? 'Hide Featured' : 'See Featured'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.challengeText}>{challenge?.title || 'What\'s your workspace looking like today?'}</Text>
        
        {challenge?.description && (
          <Text style={styles.description}>{challenge.description}</Text>
        )}
        
        {challenge?.hashtag && (
          <Text style={styles.hashtag}>{challenge.hashtag}</Text>
        )}
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleRespond}>
            <Text style={styles.buttonText}>Respond Now</Text>
          </TouchableOpacity>
          
          {challenge?.expiresAt && (
            <Text style={styles.expiresText}>
              Expires in {getTimeRemaining(challenge.expiresAt)}
            </Text>
          )}
        </View>
      </View>
      
      {/* Featured snaps section */}
      {showFeatured && featuredSnaps.length > 0 && (
        <View style={styles.featuredContainer}>
          <Text style={styles.featuredTitle}>Featured Responses</Text>
          
          <View style={styles.featuredGrid}>
            {featuredSnaps.map((snap, index) => (
              <View key={index} style={styles.featuredItem}>
                <ResponsiveImage
                  source={{ uri: snap.imageUrl || 'https://via.placeholder.com/100' }}
                  style={styles.featuredImage}
                  width={100}
                  height={100}
                  resizeMode="cover"
                />
                <Text style={styles.featuredUser}>
                  {snap.userName || 'User'}
                </Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.featuredInfo}>
            Participate in the daily challenge for a chance to be featured!
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper function to calculate time remaining
const getTimeRemaining = (expiresAt) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry - now;
  
  if (diffMs <= 0) {
    return 'Expired';
  }
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHrs > 0) {
    return `${diffHrs}h ${diffMins}m`;
  } else {
    return `${diffMins}m`;
  }
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  container: {
    backgroundColor: theme.colors.primary + '10', // 10% opacity
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  featuredToggle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  challengeText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  hashtag: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
  },
  expiresText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  featuredContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  featuredTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  featuredGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  featuredItem: {
    alignItems: 'center',
    width: '30%',
  },
  featuredImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  featuredUser: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  featuredInfo: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default DailyChallenge;
