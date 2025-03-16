import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { isWeb, isIOS, isAndroid } from '../../utils/platform';
import { getOptimizedImageUri } from '../../utils/performance';
import theme from '../../styles/theme';

/**
 * Responsive image component with optimized loading for different platforms
 */
const ResponsiveImage = ({
  source,
  width,
  height,
  style = {},
  resizeMode = 'cover',
  fallbackSource,
  quality = 80,
  showLoadingIndicator = true,
  loadingIndicatorColor = theme.colors.primary,
  loadingIndicatorSize = 'small',
  onLoad,
  onError,
  testID = 'responsive-image',
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Calculate image dimensions
  const calculatedWidth = width || style.width || screenWidth;
  const calculatedHeight = height || style.height || screenWidth * 0.6; // Default aspect ratio
  
  // Optimize image URI based on platform and dimensions
  const optimizedSource = useMemo(() => {
    // If source is an object with uri property (remote image)
    if (source && typeof source === 'object' && source.uri) {
      const optimizedUri = getOptimizedImageUri(source.uri, {
        width: calculatedWidth,
        height: calculatedHeight,
        quality
      });
      
      return { ...source, uri: optimizedUri };
    }
    
    // If source is a number (local image), return as is
    return source;
  }, [source, calculatedWidth, calculatedHeight, quality]);
  
  // Handle image load success
  const handleLoad = (event) => {
    setLoading(false);
    setError(false);
    
    // Get original image dimensions if available
    if (event && event.nativeEvent && event.nativeEvent.source) {
      const { width, height } = event.nativeEvent.source;
      setImageSize({ width, height });
    }
    
    if (onLoad) {
      onLoad(event);
    }
  };
  
  // Handle image load error
  const handleError = (event) => {
    setLoading(false);
    setError(true);
    
    if (onError) {
      onError(event);
    }
  };
  
  // Preload image on mount
  useEffect(() => {
    if (isWeb) return; // Skip preloading on web
    
    setLoading(true);
    setError(false);
    
    // If source is a remote image
    if (source && typeof source === 'object' && source.uri) {
      Image.prefetch(source.uri)
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    } else {
      // For local images, no need to prefetch
      setLoading(false);
    }
    
    return () => {
      // Cleanup
    };
  }, [source]);
  
  // Combine styles
  const combinedStyle = [
    styles.image,
    {
      width: calculatedWidth,
      height: calculatedHeight,
    },
    style,
  ];
  
  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!showLoadingIndicator || !loading) return null;
    
    return (
      <View style={[styles.loadingContainer, { width: calculatedWidth, height: calculatedHeight }]}>
        <ActivityIndicator color={loadingIndicatorColor} size={loadingIndicatorSize} />
      </View>
    );
  };
  
  // Render fallback image
  const renderFallbackImage = () => {
    if (!error || !fallbackSource) return null;
    
    return (
      <Image
        source={fallbackSource}
        style={combinedStyle}
        resizeMode={resizeMode}
        testID={`${testID}-fallback`}
      />
    );
  };
  
  // Render main image
  const renderImage = () => {
    if (error && fallbackSource) return null;
    
    return (
      <Image
        source={optimizedSource}
        style={combinedStyle}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        testID={testID}
        {...props}
      />
    );
  };
  
  return (
    <View style={[styles.container, { width: calculatedWidth, height: calculatedHeight }]}>
      {renderImage()}
      {renderFallbackImage()}
      {renderLoadingIndicator()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
});

export default React.memo(ResponsiveImage);
