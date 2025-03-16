import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Image } from 'react-native';
import { isWeb } from './platform';

/**
 * Custom hook for memoizing expensive calculations
 * @param {Function} calculationFn - Function that performs the expensive calculation
 * @param {Array} dependencies - Array of dependencies that trigger recalculation
 * @returns {any} The memoized calculation result
 */
export const useMemoizedCalculation = (calculationFn, dependencies) => {
  return useMemo(() => {
    console.log('Performing expensive calculation');
    return calculationFn();
  }, dependencies);
};

/**
 * Custom hook for debouncing function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const useDebounce = (fn, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
};

/**
 * Custom hook for throttling function calls
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const useThrottle = (fn, limit) => {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;
    
    if (timeSinceLastRun >= limit) {
      lastRunRef.current = now;
      fn(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        fn(...args);
      }, limit - timeSinceLastRun);
    }
  }, [fn, limit]);
};

/**
 * Custom hook for lazy loading components
 * @param {Function} importFn - Function that imports the component
 * @returns {Object} Object containing the component and loading state
 */
export const useLazyComponent = (importFn) => {
  const [component, setComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadComponent = async () => {
      try {
        const module = await importFn();
        if (isMounted) {
          setComponent(module.default);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading component:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadComponent();
    
    return () => {
      isMounted = false;
    };
  }, [importFn]);
  
  return { component, loading };
};

/**
 * Optimizes image loading based on platform and screen size
 * @param {string} uri - Image URI
 * @param {Object} options - Options for image optimization
 * @returns {string} Optimized image URI
 */
export const getOptimizedImageUri = (uri, options = {}) => {
  const { width, height, quality = 80 } = options;
  
  if (!uri) return uri;
  
  // For web platform, use responsive images
  if (isWeb) {
    // If it's an unsplash image, use their image API
    if (uri.includes('unsplash.com')) {
      const baseUri = uri.split('?')[0];
      return `${baseUri}?w=${width || 'auto'}&q=${quality}`;
    }
    
    // For other images, return as is
    return uri;
  }
  
  // For native platforms, return the original URI
  // In a real app, you might use a CDN or image processing service
  return uri;
};

/**
 * Preloads images for faster display
 * @param {Array} imageUris - Array of image URIs to preload
 */
export const preloadImages = (imageUris) => {
  if (!Array.isArray(imageUris)) return;
  
  imageUris.forEach(uri => {
    if (typeof uri === 'string') {
      Image.prefetch(uri).catch(error => {
        console.warn('Error preloading image:', error);
      });
    }
  });
};

/**
 * Custom hook for tracking component render performance
 * @param {string} componentName - Name of the component to track
 */
export const useRenderPerformance = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    console.log(`[Performance] ${componentName} rendered ${renderCount.current} times. Time since last render: ${timeSinceLastRender}ms`);
    
    return () => {
      console.log(`[Performance] ${componentName} unmounted after ${renderCount.current} renders`);
    };
  });
};
