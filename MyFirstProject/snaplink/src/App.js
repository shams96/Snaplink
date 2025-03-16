import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Platform, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { SplashScreenFeature } from './utils/nativeFeatures';
import { setupGlobalErrorHandling } from './utils/errorHandling';
import { isIOS, isAndroid, isWeb } from './utils/platform';
import theme from './styles/theme';

// Import screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import FriendsScreen from './screens/FriendsScreen';
import CameraScreen from './screens/CameraScreen';
import InviteScreen from './screens/InviteScreen';

// Import reducers
import userReducer from './redux/userSlice';
import snapsReducer from './redux/snapsSlice';

// Import common components
import SafeAreaContainer from './components/common/SafeAreaContainer';
import NetworkStatusBar from './components/common/NetworkStatusBar';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested',
    'Setting a timer for a long period of time',
  ]);
}

// Set up global error handling
setupGlobalErrorHandling();

// Configure Redux store with performance optimizations
const store = configureStore({
  reducer: {
    user: userReducer,
    snaps: snapsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['user.user', 'snaps.snaps.timestamp'],
      },
    }),
});

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle splash screen
  const hideSplashScreen = useCallback(async () => {
    try {
      await SplashScreenFeature.hide({ fadeOutDuration: 500 });
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }, []);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
        // Hide splash screen after authentication check
        hideSplashScreen();
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing, hideSplashScreen]);

  // Platform-specific header styles
  const getHeaderOptions = () => {
    const baseOptions = {
      headerStyle: {
        backgroundColor: theme.colors.background,
        elevation: 0, // for Android
        shadowOpacity: 0, // for iOS
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface,
        height: Platform.select({
          ios: 44,
          android: 56,
          default: 64,
        }),
      },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: Platform.select({
          ios: 17,
          android: 20,
          default: 18,
        }),
      },
    };

    // Platform-specific adjustments
    if (isIOS) {
      return {
        ...baseOptions,
        headerBackTitleVisible: false,
      };
    } else if (isAndroid) {
      return {
        ...baseOptions,
        headerTitleAlign: 'center',
      };
    }

    return baseOptions;
  };

  // Loading screen
  if (initializing) {
    return (
      <SafeAreaContainer style={styles.loadingContainer} useSafeArea={false}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaContainer>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaContainer useSafeArea={false} style={styles.container}>
          <NetworkStatusBar />
          <Stack.Navigator
            initialRouteName={user ? "Home" : "Login"}
            screenOptions={getHeaderOptions()}
          >
            {user ? (
              // Authenticated user screens
              <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ title: 'SnapLink' }}
              />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Friends" component={FriendsScreen} />
              <Stack.Screen 
                name="Camera" 
                component={CameraScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Invite" 
                component={InviteScreen} 
                options={{ title: 'Invite Friends' }}
              />
              </>
            ) : (
              // Authentication screens
              <>
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Register" 
                  component={RegisterScreen} 
                  options={{ headerShown: false }}
                />
              </>
            )}
          </Stack.Navigator>
        </SafeAreaContainer>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default App;
