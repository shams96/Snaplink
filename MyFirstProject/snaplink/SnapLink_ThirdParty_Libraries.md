# SnapLink Third-Party Libraries

## Core Dependencies

| Library               | Purpose                          | Version | Integration Notes                                                                 |
|-----------------------|----------------------------------|---------|-----------------------------------------------------------------------------------|
| Firebase SDK          | Authentication, Realtime DB, Storage | 10.5.0  | Mandatory for core backend services (Auth, RTDB, Storage, FCM)                     |
| React Native          | Cross-platform UI framework      | 0.72.6  | Required for iOS/Android app development                                           |
| TensorFlow Lite       | On-device AI inference           | 4.5.0   | Needed for AI suggestions and auto-snap generation (requires model conversion)     |
| Sentry                | Error monitoring                 | 5.32.0  | Realtime crash reporting and performance tracking                                  |
| Google Cloud Vision   | Content sensitivity analysis     | N/A     | Requires API key setup for pre-upload content moderation                          |
| Twilio Verify         | Optional 2FA for security        | 7.5.0   | Pending approval for production use (optional)                                    |

## Optional Enhancements

| Library               | Purpose                          | Version | Notes                                                                 |
|-----------------------|----------------------------------|---------|-----------------------------------------------------------------------|
| Redux Toolkit         | State management                 | 1.9.5   | For complex state workflows (alternative to Context API)                  |
| Lottie Web            | Animated UI elements             | 6.1.0   | Optional for reaction clip animations                                      |
| AWS Amplify           | Cloud infrastructure             | 5.3.0   | Alternative to Firebase for scalability testing (experimental)            |

## Setup Instructions

### Firebase SDK
```bash
# Installation
npm install firebase@10.5.0

# Configuration
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "snaplink.firebaseapp.com",
  projectId: "snaplink",
  storageBucket: "snaplink.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
initializeApp(firebaseConfig);
```

### TensorFlow Lite
```bash
npm install @tensorflow/tfjs @tensorflow-models/mobilenet
# See official docs for model conversion steps
```

### Sentry Integration
```bash
npm install @sentry/react-native
# Configure DSN in sentry.properties
sentry.properties:
  sentry.project=:YOUR_SENTRY_PROJECT
  sentry.org=:YOUR_SENTRY_ORG
  sentry.dsn=https://<key>@sentry.io/<project>
