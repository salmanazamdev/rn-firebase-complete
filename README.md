# 🔥 React Native Firebase Complete Integration

A comprehensive React Native application demonstrating **Firebase Push Notifications** and **Firebase Analytics** integration with a beautiful, production-ready UI.

## ✨ Features

### 📱 Push Notifications
- ✅ **Foreground Notifications** - Alert dialogs when app is active
- ✅ **Background Notifications** - System notifications in notification bar
- ✅ **Notification Channels** - Proper Android 8.0+ channel management
- ✅ **FCM Token Management** - Easy token copying for testing
- ✅ **Local Notifications** - Test notifications without server
- ✅ **Notification History** - Track received notifications in-app

### 📊 Analytics Integration
- ✅ **Event Tracking** - Comprehensive user interaction analytics
- ✅ **Screen Views** - Automatic screen tracking
- ✅ **User Properties** - User segmentation support
- ✅ **Custom Events** - Business-specific event logging
- ✅ **Real-time Testing** - DebugView integration for live testing
- ✅ **Error Tracking** - Analytics error monitoring

### 🎨 UI/UX Features
- ✅ **Modern Material Design** - Clean, professional interface
- ✅ **Status Indicators** - Real-time feature status display
- ✅ **Interactive Testing** - Built-in test buttons for all features
- ✅ **Comprehensive Guides** - In-app testing instructions
- ✅ **Responsive Layout** - Works on all Android screen sizes

<!-- ## 📸 Screenshots

[Add your app screenshots here] -->

## 🚀 Quick Start

### Prerequisites

- React Native development environment set up
- Android Studio installed
- Firebase project created
- Physical Android device (recommended for push notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/salmanazamdev/rn-firebase-complete
cd rn-firebase-complete
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install required Firebase packages**
```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
npm install @react-native-firebase/analytics
npm install react-native-push-notification
```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add Android app to your project
   - Download `google-services.json`
   - Place it in `android/app/` directory
   - Enable **Cloud Messaging** and **Analytics** in Firebase Console

5. **Android Configuration**

Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.1.0'
    implementation 'com.google.firebase:firebase-analytics:21.5.0'
}

apply plugin: 'com.google.gms.google-services'
```

Add to `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

6. **Run the application**
```bash
npx react-native run-android
```

## 🧪 Testing

### Push Notifications Testing

1. **Get FCM Token**
   - Launch the app
   - Tap "Copy Token to Console"
   - Copy the token from terminal

2. **Send Test Notification**
   - Go to [Firebase Console](https://console.firebase.google.com/) → Cloud Messaging
   - Click "Send your first message"
   - Enter title and body
   - Click "Test on device"
   - Paste your FCM token
   - Send!

3. **Test Different States**
   - **Foreground**: Keep app open → Should show alert
   - **Background**: Press home button → Should show in notification bar
   - **Closed**: Close app completely → Should show in notification bar

### Analytics Testing

1. **Enable Debug Mode**
```bash
adb shell setprop debug.firebase.analytics.app com.pushnotificationdemo
```

2. **Real-time Testing**
   - Go to Firebase Console → Analytics → DebugView
   - Tap "Test Analytics Event" in app
   - See events appear in real-time!

3. **View Reports**
   - Firebase Console → Analytics → Events
   - Firebase Console → Analytics → Dashboard
   - Data appears within 24-48 hours for reports

## 📋 Firebase Console Setup

### 1. Enable Cloud Messaging
- Firebase Console → Project Settings → Cloud Messaging
- Note your Server Key for API testing

### 2. Enable Analytics
- Firebase Console → Analytics → Dashboard
- Click "Enable Analytics" if not enabled
- Link to Google Analytics account

### 3. Verify Configuration
- Check that `google-services.json` package name matches your app
- Ensure both services are enabled in your Firebase project

## 🛠️ Customization

### Adding Custom Events
```typescript
import analytics from '@react-native-firebase/analytics';

// Log custom event
await analytics().logEvent('custom_event_name', {
  parameter_1: 'value1',
  parameter_2: 123,
  timestamp: Date.now(),
});
```

### Adding User Properties
```typescript
// Set user properties
await analytics().setUserProperty('user_type', 'premium');
await analytics().setUserProperty('preferred_category', 'tech');
```

### Custom Notification Channels
```typescript
PushNotification.createChannel({
  channelId: "custom_channel",
  channelName: "Custom Notifications",
  importance: 5,
  vibrate: true,
});
```

## 📊 Analytics Events Tracked

The app automatically tracks:

- `app_open` - App launches
- `screen_view` - Screen transitions
- `notification_received` - Push notifications received
- `notification_opened_app` - App opened via notification
- `fcm_token_received` - FCM token generation
- `test_local_notification_sent` - Test notification sent
- `analytics_initialized` - Analytics setup complete
- `notifications_cleared` - Notification history cleared

## 🐛 Troubleshooting

### Common Issues

**Notifications not appearing?**
- Check device notification permissions
- Disable battery optimization for your app
- Ensure `google-services.json` is in correct location
- Verify notification channel setup

**Analytics not working?**
- Check if Analytics is enabled in Firebase Console
- Verify `google-services.json` configuration
- Use DebugView for real-time testing
- Events may take 24-48 hours to appear in reports

**Build errors?**
```bash
cd android && ./gradlew clean && cd .. && npx react-native run-android
```

### Debug Commands
```bash
# Check app logs
adb logcat | grep -i "firebase"

# Enable analytics debug mode
adb shell setprop debug.firebase.analytics.app YOUR_PACKAGE_NAME

# Clear app data
adb shell pm clear YOUR_PACKAGE_NAME
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [React Native Firebase](https://rnfirebase.io/) for excellent Firebase integration
- [Firebase](https://firebase.google.com/) for powerful backend services
- [React Native Push Notification](https://github.com/zo0r/react-native-push-notification) for local notifications

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](https://github.com/salmanazamdev/rn-firebase-complete/issues) page
2. Create a new issue with detailed information
3. [LinkedIn](https://www.linkedin.com/in/salmanazamdev?)

---

⭐ **Star this repo** if it helped you! It motivates me to create more awesome projects.

## 🔄 Recent Updates

- ✅ Added comprehensive Firebase Analytics integration
- ✅ Enhanced UI with real-time status indicators
- ✅ Added in-app testing tools for both features
- ✅ Improved error handling and logging
- ✅ Added user properties and custom event tracking
- ✅ Added detailed testing guides and troubleshooting