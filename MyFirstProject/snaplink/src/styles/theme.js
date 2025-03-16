import { isIOS, isAndroid, isSmallScreen, isMediumScreen, isLargeScreen } from '../utils/platform';

/**
 * Color palette for the app
 */
export const colors = {
  // Primary colors
  primary: '#7C4DFF',
  primaryLight: '#B47CFF',
  primaryDark: '#3F1DCB',
  
  // Secondary colors
  secondary: '#03DAC6',
  secondaryLight: '#66FFF8',
  secondaryDark: '#00A896',
  
  // Accent colors
  accent: '#FF6B6B',
  accentLight: '#FF9E9E',
  accentDark: '#D14545',
  
  // Neutral colors
  background: '#FFFFFF',
  surface: '#F8F8F8',
  card: '#FFFFFF',
  
  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#888888',
    disabled: '#AAAAAA',
    inverse: '#FFFFFF',
  },
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Platform-specific colors
  platformPrimary: isIOS ? '#007AFF' : isAndroid ? '#7C4DFF' : '#7C4DFF',
  
  // Gradients
  gradients: {
    primary: ['#7C4DFF', '#B47CFF'],
    secondary: ['#03DAC6', '#66FFF8'],
    accent: ['#FF6B6B', '#FF9E9E'],
  },
  
  // Transparency
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Typography styles for the app
 */
export const typography = {
  // Font families
  fontFamily: {
    primary: isIOS ? 'System' : isAndroid ? 'Roboto' : 'Arial, sans-serif',
    secondary: isIOS ? 'Georgia' : isAndroid ? 'serif' : 'Georgia, serif',
    monospace: 'monospace',
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Font sizes - responsive based on screen size
  fontSize: {
    xs: isSmallScreen ? 10 : 12,
    sm: isSmallScreen ? 12 : 14,
    md: isSmallScreen ? 14 : 16,
    lg: isSmallScreen ? 16 : 18,
    xl: isSmallScreen ? 18 : 20,
    xxl: isSmallScreen ? 20 : 24,
    xxxl: isSmallScreen ? 24 : 30,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
  
  // Text styles
  text: {
    h1: {
      fontSize: isSmallScreen ? 24 : isLargeScreen ? 36 : 30,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: isSmallScreen ? 20 : isLargeScreen ? 30 : 24,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: isSmallScreen ? 18 : isLargeScreen ? 24 : 20,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: isSmallScreen ? 16 : isLargeScreen ? 20 : 18,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: isSmallScreen ? 10 : 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      lineHeight: 1.5,
      textTransform: 'uppercase',
    },
  },
};

/**
 * Spacing system for the app
 */
export const spacing = {
  // Base spacing units
  xxs: isSmallScreen ? 2 : 4,
  xs: isSmallScreen ? 4 : 8,
  sm: isSmallScreen ? 8 : 12,
  md: isSmallScreen ? 12 : 16,
  lg: isSmallScreen ? 16 : 24,
  xl: isSmallScreen ? 24 : 32,
  xxl: isSmallScreen ? 32 : 48,
  
  // Specific spacing
  gutter: isSmallScreen ? 16 : 24,
  containerPadding: isSmallScreen ? 16 : isLargeScreen ? 32 : 24,
  sectionSpacing: isSmallScreen ? 24 : isLargeScreen ? 48 : 32,
  
  // Platform-specific spacing
  statusBarHeight: isIOS ? 44 : 24,
  bottomNavHeight: 56,
  tabBarHeight: isIOS ? 49 : 56,
  headerHeight: isIOS ? 44 : 56,
  
  // Safe area insets
  safeAreaTop: isIOS ? 44 : 24,
  safeAreaBottom: isIOS ? 34 : 16,
  safeAreaLeft: 0,
  safeAreaRight: 0,
};

/**
 * Border radius styles for the app
 */
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

/**
 * Shadow styles for the app
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: isIOS
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }
    : {
        elevation: 1,
      },
  sm: isIOS
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    : {
        elevation: 2,
      },
  md: isIOS
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      }
    : {
        elevation: 4,
      },
  lg: isIOS
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }
    : {
        elevation: 8,
      },
  xl: isIOS
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      }
    : {
        elevation: 12,
      },
};

/**
 * Z-index values for the app
 */
export const zIndex = {
  base: 0,
  card: 10,
  header: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
  overlay: 100,
};

/**
 * Animation timing for the app
 */
export const animation = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerated: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerated: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Responsive breakpoints for the app
 */
export const breakpoints = {
  xs: 0,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Grid system for the app
 */
export const grid = {
  columns: isLargeScreen ? 12 : 4,
  gutter: isSmallScreen ? 8 : isLargeScreen ? 24 : 16,
  margin: isSmallScreen ? 16 : isLargeScreen ? 32 : 24,
};

/**
 * Complete theme object
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animation,
  breakpoints,
  grid,
  
  // Platform-specific theme overrides
  ios: {
    colors: {
      primary: '#007AFF',
    },
    typography: {
      fontFamily: {
        primary: 'System',
      },
    },
  },
  android: {
    colors: {
      primary: '#7C4DFF',
    },
    typography: {
      fontFamily: {
        primary: 'Roboto',
      },
    },
  },
  web: {
    colors: {
      primary: '#7C4DFF',
    },
    typography: {
      fontFamily: {
        primary: 'Arial, sans-serif',
      },
    },
  },
};

/**
 * Get platform-specific theme
 * @returns {Object} Platform-specific theme
 */
export const getPlatformTheme = () => {
  if (isIOS) {
    return {
      ...theme,
      ...theme.ios,
    };
  } else if (isAndroid) {
    return {
      ...theme,
      ...theme.android,
    };
  } else {
    return {
      ...theme,
      ...theme.web,
    };
  }
};

export default theme;
