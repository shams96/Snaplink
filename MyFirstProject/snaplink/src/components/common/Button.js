import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { isAndroid, isIOS } from '../../utils/platform';
import theme from '../../styles/theme';
import { useRenderPerformance } from '../../utils/performance';

/**
 * Button variants
 */
export const ButtonVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  TEXT: 'text',
  DANGER: 'danger',
  SUCCESS: 'success',
};

/**
 * Button sizes
 */
export const ButtonSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

/**
 * Cross-platform button component with platform-specific styling and behavior
 */
const Button = ({
  onPress,
  title,
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MEDIUM,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  style = {},
  textStyle = {},
  testID = 'button',
  accessibilityLabel,
  ...props
}) => {
  // Track render performance in development
  if (__DEV__) {
    useRenderPerformance('Button');
  }
  
  // Memoize styles based on props to prevent unnecessary re-renders
  const buttonStyles = useMemo(() => {
    const variantStyle = getVariantStyle(variant);
    const sizeStyle = getSizeStyle(size);
    
    return {
      button: [
        styles.button,
        variantStyle.button,
        sizeStyle.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        disabled && variantStyle.disabled,
        style,
      ],
      text: [
        styles.text,
        variantStyle.text,
        sizeStyle.text,
        disabled && styles.disabledText,
        textStyle,
      ],
    };
  }, [variant, size, disabled, fullWidth, style, textStyle]);
  
  // Determine the appropriate touchable component based on platform
  const Touchable = useMemo(() => {
    if (isAndroid && variant !== ButtonVariant.TEXT && !disabled) {
      return TouchableNativeFeedback;
    }
    return TouchableOpacity;
  }, [variant, disabled]);
  
  // Render the button content
  const renderContent = () => (
    <View style={buttonStyles.button}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getLoadingColor(variant)}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={buttonStyles.text}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </View>
  );
  
  // For Android with ripple effect
  if (Touchable === TouchableNativeFeedback) {
    return (
      <View style={[fullWidth && styles.fullWidth, style]}>
        <Touchable
          onPress={onPress}
          disabled={disabled || loading}
          background={TouchableNativeFeedback.Ripple(
            getRippleColor(variant),
            false
          )}
          testID={testID}
          accessibilityLabel={accessibilityLabel || title}
          {...props}
        >
          {renderContent()}
        </Touchable>
      </View>
    );
  }
  
  // For iOS and other platforms
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[fullWidth && styles.fullWidth]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      {...props}
    >
      {renderContent()}
    </Touchable>
  );
};

/**
 * Get button styles based on variant
 */
const getVariantStyle = (variant) => {
  switch (variant) {
    case ButtonVariant.PRIMARY:
      return {
        button: {
          backgroundColor: theme.colors.primary,
        },
        text: {
          color: theme.colors.text.inverse,
        },
        disabled: {
          backgroundColor: theme.colors.primaryLight + '80', // 50% opacity
        },
      };
    case ButtonVariant.SECONDARY:
      return {
        button: {
          backgroundColor: theme.colors.secondary,
        },
        text: {
          color: theme.colors.text.inverse,
        },
        disabled: {
          backgroundColor: theme.colors.secondaryLight + '80',
        },
      };
    case ButtonVariant.OUTLINE:
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
        text: {
          color: theme.colors.primary,
        },
        disabled: {
          borderColor: theme.colors.primaryLight + '80',
        },
      };
    case ButtonVariant.TEXT:
      return {
        button: {
          backgroundColor: 'transparent',
          paddingHorizontal: theme.spacing.sm,
          minWidth: 0,
        },
        text: {
          color: theme.colors.primary,
        },
        disabled: {
          backgroundColor: 'transparent',
        },
      };
    case ButtonVariant.DANGER:
      return {
        button: {
          backgroundColor: theme.colors.error,
        },
        text: {
          color: theme.colors.text.inverse,
        },
        disabled: {
          backgroundColor: theme.colors.error + '80',
        },
      };
    case ButtonVariant.SUCCESS:
      return {
        button: {
          backgroundColor: theme.colors.success,
        },
        text: {
          color: theme.colors.text.inverse,
        },
        disabled: {
          backgroundColor: theme.colors.success + '80',
        },
      };
    default:
      return {
        button: {},
        text: {},
        disabled: {},
      };
  }
};

/**
 * Get button styles based on size
 */
const getSizeStyle = (size) => {
  switch (size) {
    case ButtonSize.SMALL:
      return {
        button: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          minHeight: 32,
        },
        text: {
          fontSize: theme.typography.fontSize.sm,
        },
      };
    case ButtonSize.LARGE:
      return {
        button: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 56,
        },
        text: {
          fontSize: theme.typography.fontSize.lg,
        },
      };
    case ButtonSize.MEDIUM:
    default:
      return {
        button: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          minHeight: 44,
        },
        text: {
          fontSize: theme.typography.fontSize.md,
        },
      };
  }
};

/**
 * Get loading indicator color based on variant
 */
const getLoadingColor = (variant) => {
  switch (variant) {
    case ButtonVariant.OUTLINE:
    case ButtonVariant.TEXT:
      return theme.colors.primary;
    default:
      return theme.colors.text.inverse;
  }
};

/**
 * Get ripple color for Android based on variant
 */
const getRippleColor = (variant) => {
  switch (variant) {
    case ButtonVariant.OUTLINE:
    case ButtonVariant.TEXT:
      return theme.colors.primary + '40'; // 25% opacity
    default:
      return 'rgba(255, 255, 255, 0.3)';
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
      default: {
        // Web styles
      },
    }),
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});

export default React.memo(Button);
