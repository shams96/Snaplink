# SnapLink - Cross-Platform Social Media App

SnapLink is a social media app designed for authentic moments, allowing users to share spontaneous content with friends without the pressure of traditional social media.

## Project Overview

This project is configured to run on multiple platforms:
- Web (PWA)
- iOS (via Capacitor)
- Android (via Capacitor)

## Cross-Platform Consistency & Performance

To ensure SnapLink runs seamlessly across all platforms, we've implemented the following strategies:

### 1. Platform-Specific Utilities

- **Platform Detection**: Using `platform.js` to detect the current platform and adjust behavior accordingly
- **Responsive Design**: Adapting UI elements based on screen size and platform
- **Theme System**: Consistent design system with platform-specific adjustments

### 2. Performance Optimization

- **Memoization**: Using React.memo and useMemo to prevent unnecessary re-renders
- **Image Optimization**: Responsive image loading with proper caching
- **Lazy Loading**: Components and assets are loaded only when needed
- **Error Handling**: Robust error handling with fallbacks and retries

### 3. Cross-Platform Components

- **Button**: Platform-specific button behavior (ripple on Android, opacity on iOS)
- **ResponsiveImage**: Optimized image loading across platforms
- **SafeAreaContainer**: Proper safe area handling for notches and system UI
- **NetworkStatusBar**: Network connectivity status with platform-specific styling

### 4. Native Feature Handling

- **Camera**: Proper fallbacks for web platform
- **Push Notifications**: Platform-specific notification handling
- **Storage**: Consistent storage API across platforms
- **Splash Screen**: Native splash screen with smooth transitions

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snaplink.git
cd snaplink
```

2. Install dependencies:
```bash
npm install
```

3. Sync Capacitor:
```bash
npx cap sync
```

### Running the App

#### Web (PWA)

To run the app as a Progressive Web App:

```bash
npm start
```

This will serve the app at http://localhost:5000

#### Android

To run on Android:

```bash
npm run android
```

Or manually:

```bash
npx cap open android
```

Then build and run from Android Studio.

#### iOS

To run on iOS:

```bash
npm run ios
```

Or manually:

```bash
npx cap open ios
```

Then build and run from Xcode.

### Live Reload for Development

For development with live reload:

```bash
# Start the web server
npm start

# In another terminal, run with live reload
npx cap run android --livereload --external
# or
npx cap run ios --livereload --external
```

## Project Structure

```
snaplink/
├── app.json                # App configuration
├── index.js                # Entry point
├── package.json            # Dependencies
├── src/
│   ├── App.js              # Main app component
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Cross-platform UI components
│   ├── firebase/           # Firebase configuration
│   ├── redux/              # Redux store and slices
│   ├── screens/            # App screens
│   ├── services/           # Business logic services
│   ├── styles/             # Theme and styling
│   └── utils/              # Utility functions
│       ├── platform.js     # Platform detection utilities
│       ├── performance.js  # Performance optimization utilities
│       ├── nativeFeatures.js # Native feature handling
│       └── errorHandling.js # Error handling utilities
```

## Features

- **Smart Timing & Engagement**: Analyzes user activity patterns to determine optimal posting times and schedule notifications.
- **Live Widget Sharing**: Allows users to share snaps directly from the home screen widget.
- **Flexible Sharing Controls**: Provides granular control over who can see your content with friend groups and privacy settings.
- **Privacy & Safety**: Includes end-to-end encryption and content scanning to ensure a safe experience.
- **AI-Enhanced Features**: Uses AI to suggest captions and auto-snap suggestion mode.
- **Casual Interaction Tools**: Offers reaction clips and quick replies for lightweight engagement.

## Testing Across Platforms

For comprehensive cross-platform testing:

1. **Web Testing**: Test in multiple browsers (Chrome, Safari, Firefox) and screen sizes
2. **iOS Testing**: Test on different iOS versions and device sizes
3. **Android Testing**: Test on various Android versions and device manufacturers
4. **Performance Testing**: Monitor performance metrics on each platform
5. **Network Testing**: Test under different network conditions (fast, slow, offline)

## Troubleshooting Common Issues

### iOS-Specific Issues

- **Safe Area Insets**: Ensure proper handling of notches and home indicators
- **App Store Requirements**: Follow Apple's guidelines for app submission

### Android-Specific Issues

- **Device Fragmentation**: Test on multiple device sizes and manufacturers
- **Permission Handling**: Implement proper permission requests and fallbacks

### Web-Specific Issues

- **Browser Compatibility**: Ensure compatibility with major browsers
- **PWA Features**: Implement proper offline support and installability

## Documentation

- [Product Requirements Document](./SnapLink_PRD.md)
- [Frontend Documentation](./SnapLink_Frontend_Documentation.md)
- [Backend Documentation](./SnapLink_Backend_Documentation.md)
- [Third-Party Libraries](./SnapLink_ThirdParty_Libraries.md)

## License

MIT
