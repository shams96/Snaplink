import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { isIOS, isAndroid, isWeb } from '../../utils/platform';
import theme from '../../styles/theme';

/**
 * SafeAreaContainer component that handles safe area insets across different platforms
 * and provides consistent padding and background colors
 */
const SafeAreaContainer = ({
  children,
  style = {},
  backgroundColor = theme.colors.background,
  statusBarColor = theme.colors.background,
  statusBarStyle = 'dark-content',
  edges = ['top', 'right', 'bottom', 'left'],
  useSafeArea = true,
  paddingHorizontal = theme.spacing.containerPadding,
  paddingVertical = 0,
  testID = 'safe-area-container',
  ...props
}) => {
  // Determine if we need to apply top padding for status bar
  const needsStatusBarPadding = isAndroid && !useSafeArea;
  
  // Calculate top padding based on platform and useSafeArea flag
  const topPadding = needsStatusBarPadding ? StatusBar.currentHeight || 0 : 0;
  
  // Combine styles
  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      paddingTop: paddingVertical || topPadding,
      paddingBottom: paddingVertical,
      paddingHorizontal,
    },
    style,
  ];
  
  // Set status bar configuration
  const renderStatusBar = () => (
    <StatusBar
      backgroundColor={statusBarColor}
      barStyle={statusBarStyle}
      translucent={isAndroid}
    />
  );
  
  // For web platform
  if (isWeb) {
    return (
      <View style={containerStyle} testID={testID} {...props}>
        {renderStatusBar()}
        {children}
      </View>
    );
  }
  
  // For iOS and Android with SafeArea
  if (useSafeArea) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        testID={testID}
        {...props}
      >
        {renderStatusBar()}
        <View style={containerStyle}>{children}</View>
      </SafeAreaView>
    );
  }
  
  // For Android without SafeArea or when explicitly disabled
  return (
    <View style={containerStyle} testID={testID} {...props}>
      {renderStatusBar()}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default SafeAreaContainer;
