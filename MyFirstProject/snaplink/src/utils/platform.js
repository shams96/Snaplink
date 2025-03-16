import { Platform, Dimensions } from 'react-native';

// Platform detection
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
export const isNative = isIOS || isAndroid;

// Screen dimensions
const { width, height } = Dimensions.get('window');
export const screenWidth = width;
export const screenHeight = height;
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 768;
export const isLargeScreen = width >= 768;

// Platform-specific styling
export const platformStyles = {
  // Shadow styles
  shadow: isIOS
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    : {
        elevation: 2,
      },
  
  // Font styles
  fontFamily: isIOS 
    ? 'System' 
    : isAndroid 
      ? 'Roboto' 
      : 'Arial, sans-serif',
  
  // Platform-specific spacing
  spacing: {
    tiny: isIOS ? 4 : 4,
    small: isIOS ? 8 : 8,
    medium: isIOS ? 16 : 16,
    large: isIOS ? 24 : 20,
    extraLarge: isIOS ? 32 : 28,
  },
  
  // Safe area insets
  safeAreaTop: isIOS ? 44 : 24,
  safeAreaBottom: isIOS ? 34 : 16,
  
  // Platform-specific animations
  animationDuration: isIOS ? 300 : 250,
};

// Responsive sizing
export const responsive = {
  fontSize: {
    small: isSmallScreen ? 12 : 14,
    medium: isSmallScreen ? 14 : 16,
    large: isSmallScreen ? 16 : 18,
    extraLarge: isSmallScreen ? 20 : 24,
  },
  spacing: {
    small: isSmallScreen ? 8 : 12,
    medium: isSmallScreen ? 16 : 20,
    large: isSmallScreen ? 24 : 32,
  },
  iconSize: {
    small: isSmallScreen ? 16 : 20,
    medium: isSmallScreen ? 24 : 28,
    large: isSmallScreen ? 32 : 36,
  },
};

// Responsive grid system
export const grid = {
  containerPadding: isSmallScreen ? 16 : 20,
  columnGap: isSmallScreen ? 8 : 12,
  columns: isLargeScreen ? 12 : 4,
};

// Device detection for more specific optimizations
export const isTablet = () => {
  const ratio = height / width;
  return ratio <= 1.6;
};

// Orientation detection
export const isPortrait = () => {
  return height > width;
};

// Listener for dimension changes
export const addDimensionListener = (callback) => {
  return Dimensions.addEventListener('change', callback);
};

// Platform-specific timing
export const timing = {
  debounce: isIOS ? 300 : 250,
  throttle: isIOS ? 200 : 150,
};
