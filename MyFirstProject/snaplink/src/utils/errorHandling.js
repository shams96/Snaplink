import { useState, useEffect, useCallback } from 'react';
import { NetInfo } from '@capacitor/core';
import { isNative } from './platform';

/**
 * Error types for consistent error handling
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  STORAGE: 'STORAGE_ERROR',
  FEATURE_UNAVAILABLE: 'FEATURE_UNAVAILABLE'
};

/**
 * Custom error class with additional metadata
 */
export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
  
  /**
   * Gets a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    switch (this.type) {
      case ErrorTypes.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorTypes.AUTH:
        return 'Authentication error. Please sign in again.';
      case ErrorTypes.PERMISSION:
        return 'Permission denied. Please grant the required permissions in your device settings.';
      case ErrorTypes.VALIDATION:
        return this.message || 'Please check your input and try again.';
      case ErrorTypes.SERVER:
        return 'Server error. Our team has been notified. Please try again later.';
      case ErrorTypes.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorTypes.STORAGE:
        return 'Storage error. Please check your device storage.';
      case ErrorTypes.FEATURE_UNAVAILABLE:
        return 'This feature is not available on your device.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
  
  /**
   * Gets error details for logging
   * @returns {Object} Error details
   */
  getDetails() {
    return {
      type: this.type,
      message: this.message,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : null,
      timestamp: this.timestamp
    };
  }
}

/**
 * Safely executes a function with error handling
 * @param {Function} fn - Function to execute
 * @param {Object} options - Options for error handling
 * @returns {Promise<any>} Result of the function or error
 */
export const tryCatch = async (fn, options = {}) => {
  const {
    fallbackValue = null,
    rethrow = false,
    errorType = ErrorTypes.UNKNOWN,
    errorMessage = 'An error occurred',
    timeout = 30000 // 30 seconds default timeout
  } = options;
  
  try {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new AppError(ErrorTypes.TIMEOUT, 'Operation timed out'));
      }, timeout);
    });
    
    // Race the function against the timeout
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error) {
    console.error('Error in tryCatch:', error);
    
    // Create a standardized AppError
    const appError = error instanceof AppError
      ? error
      : new AppError(errorType, errorMessage, error);
    
    // Log the error (in a real app, this might send to a logging service)
    logError(appError);
    
    // Rethrow or return fallback
    if (rethrow) {
      throw appError;
    }
    
    return fallbackValue;
  }
};

/**
 * Logs an error to the console and potentially to a remote service
 * @param {Error} error - The error to log
 */
export const logError = (error) => {
  const errorDetails = error instanceof AppError
    ? error.getDetails()
    : {
        type: ErrorTypes.UNKNOWN,
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
  
  console.error('Error logged:', errorDetails);
  
  // In a production app, you would send this to a logging service
  // Example: sendToLoggingService(errorDetails);
};

/**
 * Custom hook for network state
 * @returns {Object} Network state information
 */
export const useNetworkState = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  
  const checkNetworkStatus = useCallback(async () => {
    try {
      if (isNative) {
        const status = await NetInfo.getStatus();
        setIsConnected(status.connected);
        setConnectionType(status.connectionType);
      } else {
        setIsConnected(navigator.onLine);
        setConnectionType(navigator.connection?.effectiveType || 'unknown');
      }
    } catch (error) {
      console.error('Error checking network status:', error);
      setIsConnected(true); // Assume connected on error
      setConnectionType('unknown');
    }
  }, []);
  
  useEffect(() => {
    // Initial check
    checkNetworkStatus();
    
    // Set up listeners
    if (isNative) {
      const listener = NetInfo.addListener(status => {
        setIsConnected(status.connected);
        setConnectionType(status.connectionType);
      });
      
      return () => {
        listener.remove();
      };
    } else {
      const handleOnline = () => {
        setIsConnected(true);
        checkNetworkStatus();
      };
      
      const handleOffline = () => {
        setIsConnected(false);
        setConnectionType('none');
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [checkNetworkStatus]);
  
  return {
    isConnected,
    connectionType,
    isWifi: connectionType === 'wifi',
    isCellular: ['cellular', '2g', '3g', '4g', '5g'].includes(connectionType),
    isSlowConnection: ['2g', '3g', 'slow-2g'].includes(connectionType),
    checkNetworkStatus
  };
};

/**
 * Custom hook for handling API requests with error handling and retries
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Options for the API call
 * @returns {Object} API call state and functions
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    initialData = null,
    onSuccess = () => {},
    onError = () => {},
    retryCount = 3,
    retryDelay = 1000,
    timeout = 30000
  } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    let attempts = 0;
    let lastError = null;
    
    while (attempts < retryCount) {
      try {
        const result = await tryCatch(() => apiFunction(...args), {
          timeout,
          rethrow: true
        });
        
        setData(result);
        setLoading(false);
        onSuccess(result);
        return result;
      } catch (err) {
        lastError = err;
        attempts++;
        
        // Don't retry for certain error types
        if (
          err.type === ErrorTypes.AUTH ||
          err.type === ErrorTypes.VALIDATION ||
          err.type === ErrorTypes.PERMISSION ||
          err.type === ErrorTypes.FEATURE_UNAVAILABLE
        ) {
          break;
        }
        
        // Wait before retrying
        if (attempts < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }
    
    // All retries failed
    setError(lastError);
    setLoading(false);
    onError(lastError);
    return null;
  }, [apiFunction, onSuccess, onError, retryCount, retryDelay, timeout]);
  
  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(initialData);
      setLoading(false);
      setError(null);
    }
  };
};

/**
 * Handles global uncaught errors
 */
export const setupGlobalErrorHandling = () => {
  if (typeof window !== 'undefined') {
    // Handle uncaught exceptions
    window.onerror = (message, source, lineno, colno, error) => {
      logError(
        new AppError(
          ErrorTypes.UNKNOWN,
          'Uncaught exception: ' + message,
          error
        )
      );
      return false; // Let the default handler run as well
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      logError(
        new AppError(
          ErrorTypes.UNKNOWN,
          'Unhandled promise rejection',
          event.reason
        )
      );
    });
  }
};
