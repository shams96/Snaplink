import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNative, isIOS, isAndroid } from './platform';

/**
 * Checks if a specific native feature is available
 * @param {string} feature - The feature to check
 * @returns {boolean} Whether the feature is available
 */
export const isFeatureAvailable = (feature) => {
  if (!isNative) return false;
  
  switch (feature) {
    case 'camera':
      return Capacitor.isPluginAvailable('Camera');
    case 'pushNotifications':
      return Capacitor.isPluginAvailable('PushNotifications');
    case 'splashScreen':
      return Capacitor.isPluginAvailable('SplashScreen');
    default:
      return false;
  }
};

/**
 * Safely executes a native feature with proper error handling and fallbacks
 * @param {Function} nativeFunction - The native function to execute
 * @param {Function} webFallback - Fallback function for web platform
 * @param {Object} options - Options for the native function
 * @returns {Promise<any>} Result of the native function or fallback
 */
export const safelyExecuteNativeFeature = async (nativeFunction, webFallback, options = {}) => {
  try {
    if (isNative) {
      return await nativeFunction(options);
    } else if (webFallback) {
      return await webFallback(options);
    }
    throw new Error('Feature not available on this platform');
  } catch (error) {
    console.error('Error executing native feature:', error);
    throw error;
  }
};

/**
 * Camera functionality with proper platform handling
 */
export const CameraFeature = {
  /**
   * Takes a photo using the device camera
   * @param {Object} options - Camera options
   * @returns {Promise<Object>} Photo data
   */
  takePhoto: async (options = {}) => {
    const defaultOptions = {
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
      saveToGallery: false
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return safelyExecuteNativeFeature(
      async () => await Camera.getPhoto(mergedOptions),
      async () => {
        // Web fallback using file input
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          
          input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) {
              reject(new Error('No image selected'));
              return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                webPath: reader.result,
                format: file.type.split('/')[1],
                dataUrl: reader.result
              });
            };
            reader.onerror = () => {
              reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
          };
          
          input.click();
        });
      }
    );
  },
  
  /**
   * Checks for camera permissions
   * @returns {Promise<Object>} Permission status
   */
  checkPermissions: async () => {
    return safelyExecuteNativeFeature(
      async () => await Camera.checkPermissions(),
      async () => ({ camera: 'granted', photos: 'granted' })
    );
  },
  
  /**
   * Requests camera permissions
   * @returns {Promise<Object>} Permission status
   */
  requestPermissions: async () => {
    return safelyExecuteNativeFeature(
      async () => await Camera.requestPermissions(),
      async () => ({ camera: 'granted', photos: 'granted' })
    );
  }
};

/**
 * Push notification functionality with proper platform handling
 */
export const NotificationFeature = {
  /**
   * Registers the device for push notifications
   * @returns {Promise<void>}
   */
  register: async () => {
    return safelyExecuteNativeFeature(
      async () => {
        // Request permission first
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive === 'granted') {
          // Register with FCM/APNS
          await PushNotifications.register();
        } else {
          throw new Error('Push notification permission denied');
        }
      },
      async () => {
        console.log('Push notifications not available on web');
      }
    );
  },
  
  /**
   * Adds a listener for push notification events
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   * @returns {Promise<void>}
   */
  addListener: async (eventName, callback) => {
    return safelyExecuteNativeFeature(
      async () => {
        return PushNotifications.addListener(eventName, callback);
      },
      async () => {
        console.log(`Push notification listener (${eventName}) not available on web`);
        return { remove: () => {} };
      }
    );
  },
  
  /**
   * Gets delivery data for all notifications
   * @returns {Promise<Array>} Notifications
   */
  getDeliveredNotifications: async () => {
    return safelyExecuteNativeFeature(
      async () => await PushNotifications.getDeliveredNotifications(),
      async () => []
    );
  }
};

/**
 * Splash screen functionality with proper platform handling
 */
export const SplashScreenFeature = {
  /**
   * Shows the splash screen
   * @returns {Promise<void>}
   */
  show: async () => {
    return safelyExecuteNativeFeature(
      async () => await SplashScreen.show(),
      async () => {}
    );
  },
  
  /**
   * Hides the splash screen
   * @param {Object} options - Options for hiding the splash screen
   * @returns {Promise<void>}
   */
  hide: async (options = {}) => {
    return safelyExecuteNativeFeature(
      async () => await SplashScreen.hide(options),
      async () => {}
    );
  }
};

/**
 * Platform-specific back button handling
 * @param {Function} callback - Callback function to execute when back button is pressed
 * @returns {Function} Function to remove the listener
 */
export const handleBackButton = (callback) => {
  if (isAndroid) {
    // For Android, use the hardware back button
    const subscription = Capacitor.addListener('backButton', callback);
    return () => subscription.remove();
  } else if (isIOS) {
    // For iOS, we might add a custom back button in the UI
    // This would be handled in the component
    return () => {};
  } else {
    // For web, we might use the browser's history API
    const handlePopState = () => {
      callback();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }
};
