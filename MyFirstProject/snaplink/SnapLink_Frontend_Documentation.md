# SnapLink Frontend Documentation

## 1. Technical Stack
- **Framework**: React Native (for cross-platform iOS/Android development)
- **State Management**: Redux Toolkit for complex state, Context API for simple cases
- **Navigation**: React Navigation v6 (tab-based + modal flows)
- **UI Components**: 
  - Material-UI for consistent styling
  - NativeBase for platform-specific components
- **Real-Time Updates**: Firebase Realtime Database for widget sync
- **Media Handling**: react-native-camera for snaps, Expo AV for reaction clips
- **Push Notifications**: Firebase Cloud Messaging (FCM)

## 2. Key Screens & Features

### Home Screen
- **Widget Feed**: 
  - Live-updating friend snaps in dedicated widget area
  - Swipeable interface for quick navigation
- **Posting UI**: 
  - Floating action button (FAB) for snap creation
  - Quick access to camera/microphone
  - Group selection dropdown before posting

### Profile Screen
- **Account Settings**:
  - Preferred posting window scheduler
  - Notification preferences (nudge times, reminder tones)
  - Privacy controls (post duration, group management)
- **Activity Dashboard**:
  - Streak progress visualization
  - Weekly engagement summary

### Group Management
Friend- ** Groups**:
  - Drag-and-drop interface for contact grouping
  - Color-coded group badges for quick identification
- **Mute/Hide Controls**:
  - Context menu for temporary content suppression

### AI Features UI
- **Auto-Snap Suggestion**:
  - Permission toggle with privacy explanation
  - Preview pane for AI-curated snaps
- **Daily Challenge Prompt**:
  - Modal overlay with theme illustration
  - Progress tracker for completed challenges

## 3. Design Requirements
- **Color Scheme**:
  - Primary: #3498DB (Calming blue for trust)
  - Secondary: #27AE60 (Green for positive interactions)
  - Accent: #F1C40F (Warm yellow for notifications)
- **Typography**: 
  - Open Sans (clean modern feel)
  - Consistent 14px body text across platforms
- **Iconography**: 
  - Custom vector icons (24x24px) for core functions
  - Animated SVGs for interaction feedback

## 4. Critical Features Implementation Notes
### Live Widget Sync
- Use Firebase Realtime listeners for instant updates
- Local storage caching for offline access
- Platform-specific widget APIs (iOS Today Widget/Android App Widget)

### Reaction Clips
- 2-second recording limit enforced via timer UI
- Auto-upload to backend upon recording completion
- Mini-player component for playback in feed

### Privacy Controls
- Modal confirmation for sensitive settings changes
- Tooltip explanations for encryption features
- Dark pattern avoidance in permission requests

## 5. Third-Party Dependencies
| Library               | Purpose                                  | Version |
|-----------------------|------------------------------------------|---------|
| react-native-camera   | Photo/video capture                      | ^4.2.1  |
| @react-native-firebase/app | Push notifications & DB | ^18.5.1 |
| redux-persist          | State persistence across sessions        | ^6.0.0  |
| lottie-react-native    | Animated UI elements (e.g., streaks)     | ^5.1.4  |

## 6. Non-Functional Requirements
- **Performance**:
  - <200ms response time for UI interactions
  - <5MB total app size (base build)
- **Compatibility**:
  - iOS 14+ and Android API 29+
  - Dark mode support
