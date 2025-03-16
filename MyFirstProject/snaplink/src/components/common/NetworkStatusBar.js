import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { useNetworkState } from '../../utils/errorHandling';
import { isIOS, isAndroid, isWeb } from '../../utils/platform';
import theme from '../../styles/theme';

/**
 * NetworkStatusBar component that displays network connectivity status
 * across different platforms
 */
const NetworkStatusBar = ({
  offlineText = 'No internet connection',
  onlineText = 'Back online',
  showOnlineStatus = true,
  offlineBackgroundColor = theme.colors.error,
  onlineBackgroundColor = theme.colors.success,
  textColor = theme.colors.text.inverse,
  animationDuration = 300,
  visibleDuration = 2000,
  style = {},
  testID = 'network-status-bar',
}) => {
  const { isConnected, connectionType, isSlowConnection } = useNetworkState();
  const [visible, setVisible] = useState(false);
  const [wasConnected, setWasConnected] = useState(isConnected);
  
  // Animation value for sliding in/out
  const translateY = new Animated.Value(-50);
  
  // Screen width for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  
  // Handle network status changes
  useEffect(() => {
    // Skip initial render
    if (wasConnected === isConnected) return;
    
    // Show status bar when connection state changes
    setVisible(true);
    
    // Animate in
    Animated.timing(translateY, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
    
    // Hide after a delay if we're back online
    if (isConnected) {
      const timer = setTimeout(() => {
        // Animate out
        Animated.timing(translateY, {
          toValue: -50,
          duration: animationDuration,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      }, visibleDuration);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous connection state
    setWasConnected(isConnected);
  }, [isConnected, wasConnected, animationDuration, visibleDuration]);
  
  // Don't render if not visible and online
  if (!visible && isConnected) return null;
  
  // Don't show online status if disabled
  if (!showOnlineStatus && isConnected) return null;
  
  // Determine status text and background color
  const statusText = isConnected ? onlineText : offlineText;
  const backgroundColor = isConnected ? onlineBackgroundColor : offlineBackgroundColor;
  
  // Add slow connection warning
  const displayText = isConnected && isSlowConnection
    ? `${onlineText} (Slow Connection)`
    : statusText;
  
  // Calculate status bar height based on platform
  const statusBarHeight = Platform.select({
    ios: isIOS ? 44 : 20,
    android: StatusBar.currentHeight || 24,
    default: 0,
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY }],
          top: statusBarHeight,
        },
        style,
      ]}
      testID={testID}
    >
      <Text style={[styles.text, { color: textColor }]}>{displayText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: theme.zIndex.toast,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default React.memo(NetworkStatusBar);
