import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { addReaction } from '../redux/snapsSlice';
import ResponsiveImage from './common/ResponsiveImage';
import { useRenderPerformance } from '../utils/performance';
import { isIOS, isAndroid, isWeb, isSmallScreen } from '../utils/platform';
import theme from '../styles/theme';

const SnapCard = ({ snap }) => {
  const [showReactionModal, setShowReactionModal] = useState(false);
  const dispatch = useDispatch();
  
  // Available reactions
  const reactions = [
    { emoji: '👍', name: 'like' },
    { emoji: '❤️', name: 'love' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '🔥', name: 'fire' }
  ];
  
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

  const handleReaction = (reaction) => {
    dispatch(addReaction({
      snapId: snap.id,
      reaction: {
        type: reaction.name,
        emoji: reaction.emoji,
        userId: 'current-user-id', // In a real app, this would be the current user's ID
        timestamp: new Date().toISOString()
      }
    }));
    setShowReactionModal(false);
  };
  
  const handleToggleReactions = () => {
    setShowReactionModal(!showReactionModal);
  };

  // Track render performance in development
  if (__DEV__) {
    useRenderPerformance('SnapCard');
  }
  
  // Memoize styles to prevent unnecessary re-renders
  const cardStyles = useMemo(() => {
    return {
      container: [
        styles.container,
        snap.hasSensitiveContent && styles.sensitiveContent,
      ],
    };
  }, [snap.hasSensitiveContent]);
  
  return (
    <View style={cardStyles.container}>
      <ResponsiveImage 
        source={{ uri: snap.imageUrl }} 
        style={styles.image}
        height={200}
        resizeMode="cover"
        fallbackSource={require('../../public/icons/icon-192x192.png')}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <ResponsiveImage 
              source={{ 
                uri: snap.senderPhotoURL || 
                     `https://api.dicebear.com/6.x/personas/svg?seed=${snap.senderId}` 
              }} 
              style={styles.avatar}
              width={40}
              height={40}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.userName}>{snap.senderName || 'User'}</Text>
              <Text style={styles.timestamp}>{formatTimeAgo(snap.timestamp)}</Text>
            </View>
          </View>
        </View>
        
        {snap.caption && (
          <Text style={styles.caption}>{snap.caption}</Text>
        )}
        
        <View style={styles.footer}>
          {snap.autoPrivate && (
            <View style={styles.expirationTag}>
              <Text style={styles.expirationText}>Disappears soon</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.reactButton}
            onPress={handleToggleReactions}
          >
            <Text style={styles.reactButtonText}>React</Text>
          </TouchableOpacity>
          
          <View style={styles.reactions}>
            <Text style={styles.reactionCount}>
              {snap.reactions?.length || 0} reactions
            </Text>
          </View>
        </View>
      </View>
      
      {/* Reaction Modal */}
      <Modal
        visible={showReactionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactionModal(false)}
        >
          <View style={styles.reactionModal}>
            <View style={styles.reactionList}>
              {reactions.map(reaction => (
                <TouchableOpacity
                  key={reaction.name}
                  style={styles.reactionItem}
                  onPress={() => handleReaction(reaction)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  sensitiveContent: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  userName: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expirationTag: {
    backgroundColor: theme.colors.accent + '10', // 10% opacity
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
  },
  expirationText: {
    color: theme.colors.accent,
    fontSize: theme.typography.fontSize.xs,
  },
  reactButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
  },
  reactButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlayDark,
  },
  reactionModal: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '80%',
    maxWidth: 400,
    ...theme.shadows.md,
  },
  reactionList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  reactionItem: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.xs,
  },
  reactionEmoji: {
    fontSize: 24,
  },
});

export default SnapCard;
