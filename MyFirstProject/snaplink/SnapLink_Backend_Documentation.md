# SnapLink Backend Documentation

## 1. Technical Stack
- **Platform**: Firebase (primary backend infrastructure)
- **Database**: Firebase Realtime Database & Cloud Firestore
- **Messaging**: Firebase Cloud Messaging (FCM) for notifications
- **Storage**: Firebase Storage for media assets (snaps, reaction clips)
- **Serverless Logic**: Firebase Functions for event-driven processing
- **AI Integration**: 
  - Google Cloud Vision API for content sensitivity analysis
  - TensorFlow Lite for on-device AI suggestions (optional)
- **Authentication**: Firebase Authentication (email/password, social login)

## 2. Core API Endpoints
### User Management
- `POST /api/auth/register` - Create new user profile
- `PUT /api/users/{userId}/preferences` - Update timing/window settings
- `GET /api/users/{userId}/activity` - Retrieve user engagement metrics

### Group Management
- `POST /api/groups` - Create new friend group
- `PATCH /api/groups/{groupId}/members` - Update group membership
- `DELETE /api/groups/{groupId}` - Remove group

### Snap Operations
- `POST /api/snaps` - Upload new snap with metadata
- `GET /api/snaps/{groupId}` - Fetch group's live snaps feed
- `DELETE /api/snaps/{snapId}` - Permanently delete snap

### AI Features
- `GET /api/ai/suggested-time` - Get optimal posting time recommendations
- `POST /api/ai/auto-snap` - Request AI-curated snap suggestion
- `GET /api/ai/weekly-recap/{userId}` - Generate SnapSurprise collage

## 3. Data Models
### User Profile
```json
{
  "userId": "string",
  "preferredWindows": ["17:00-19:00"],
  "notificationPrefs": {
    "nudgeTone": "gentle",
    "delayGracePeriod": 30 // minutes
  },
  "privacySettings": {
    "defaultExpiration": "24h",
    "autoPrivateMode": true
  }
}
```

### Snap Entity
```json
{
  "snapId": "string",
  "ownerId": "string",
  "groupId": "string",
  "mediaType": "image/video",
  "contentUri": "gs://snaplink-media/",
  "expirationDate": "ISO 8601",
  "sensitivityRating": 0.3 // 0-1 scale
}
```

## 4. Security Architecture
- **Data Encryption**:
  - End-to-end encryption for snap content (AES-256)
  - Database fields containing sensitive info encrypted at rest
- **Access Control**:
  - Firebase Security Rules for collection-level permissions
  - Role-based access: User/Group Admin privileges
- **Rate Limiting**:
  - 10 snaps/post hour limit per user
  - API endpoint rate limits via Firebase Functions

## 5. Third-Party Services
| Service               | Use Case                                  | Integration Notes                  |
|-----------------------|------------------------------------------|------------------------------------|
| Google Cloud Vision   | Content sensitivity analysis             | Pre-upload analysis for blur warnings |
| Twilio Verify         | Optional 2FA for critical actions        | Pending approval for production    |
| Sentry                | Error monitoring                         | Realtime crash reporting           |

## 6. Critical Systems
### Real-Time Sync Engine
- Firebase Functions trigger on database writes
- Maintains widget state synchronization across devices
- Offline queue processing for delayed posts

### AI Scheduling Service
- Aggregates user activity data
- Machine learning model predicts optimal posting times
- Trained on engagement metrics and time patterns

### Media Pipeline
1. Client uploads media to Firebase Storage
2. Cloud Function triggers sensitivity analysis
3. Metadata stored in Firestore with encryption flags
4. Auto-expiration scheduled via Cloud Tasks
