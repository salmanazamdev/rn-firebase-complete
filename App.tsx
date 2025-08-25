import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import analytics from '@react-native-firebase/analytics';

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
}

const App: React.FC = () => {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analyticsInitialized, setAnalyticsInitialized] = useState<boolean>(false);

  // 🔥 Enhanced Analytics helper with better error handling
  const logEvent = async (name: string, params: object = {}) => {
    try {
      await analytics().logEvent(name, {
        ...params,
        timestamp: Date.now(),
        app_version: '1.0.0',
      });
      console.log(`📊 Logged event: ${name}`, params);
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  // Initialize Analytics
  const initializeAnalytics = async (): Promise<void> => {
    try {
      // Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);
      
      // Set user properties
      await analytics().setUserProperty('user_type', 'app_user');
      await analytics().setUserProperty('app_theme', 'default');
      await analytics().setUserProperty('device_type', 'android');
      
      // Log app open
      await analytics().logAppOpen();
      
      // Track screen view
      await analytics().logScreenView({
        screen_name: 'MainScreen',
        screen_class: 'MainScreen',
      });
      
      setAnalyticsInitialized(true);
      console.log('✅ Analytics initialized successfully!');
      
      // Log successful initialization
      await logEvent('analytics_initialized', {
        success: true,
        initialization_time: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
      setAnalyticsInitialized(false);
    }
  };

  // Test Analytics
  const testAnalytics = async (): Promise<void> => {
    await logEvent('test_analytics_button_pressed', {
      button_location: 'main_screen',
      user_action: 'manual_test',
      test_timestamp: new Date().toISOString(),
    });
    
    Alert.alert(
      '📊 Analytics Test Sent!',
      'Test event logged successfully!\n\n✅ Check Firebase Console → Analytics → Events\n✅ Use DebugView for real-time data\n\nNote: Regular analytics may take 24-48 hours to appear in reports.'
    );
  };

  // Create notification channel and configure PushNotification
  const createNotificationChannel = (): void => {
    PushNotification.createChannel(
      {
        channelId: "default_notification_channel",
        channelName: "General Notifications",
        channelDescription: "Notifications for general app updates",
        playSound: true,
        soundName: "default",
        importance: 5,
        vibrate: true,
      },
      (created) => {
        console.log(`Channel created: ${created}`);
        logEvent('notification_channel_created', { success: created });
      }
    );

    PushNotification.configure({
      onRegister: function (token) {
        console.log("PUSH TOKEN:", token);
        logEvent('push_token_registered', { token_received: true });
      },
      onNotification: function (notification) {
        console.log("LOCAL NOTIFICATION ==>", notification);
        logEvent('local_notification_interacted', {
          title: notification.title,
          user_interaction: notification.userInteraction,
        });
      },
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        logEvent('notification_action_pressed', {
          action: notification.action,
          title: notification.title,
        });
      },
      onRegistrationError: function(err) {
        console.error(err.message, err);
        logEvent('push_registration_error', { error: err.message });
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  // Request permission for notifications
  const requestPermission = async (): Promise<void> => {
    try {
      const authStatus = await messaging().requestPermission({
        sound: true,
        announcement: true,
        badge: true,
      });
      
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // Log permission result
      await logEvent('notification_permission_requested', {
        status: authStatus,
        granted: enabled,
        permission_type: 'firebase_messaging',
      });

      if (enabled) {
        console.log('Authorization status:', authStatus);
        getFCMToken();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Permission request error:', error);
      await logEvent('permission_request_error', { error: error.toString() });
    }
  };

  // Get FCM Token
  const getFCMToken = async (): Promise<void> => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setFcmToken(token);

      // Log token received
      await logEvent('fcm_token_received', { 
        token_length: token.length,
        success: true,
      });
    } catch (error) {
      console.log('Error getting FCM token:', error);
      await logEvent('fcm_token_error', { error: error.toString() });
    }
  };

  // Show local notification with proper channel
  const showLocalNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage): void => {
    PushNotification.localNotification({
      channelId: "default_notification_channel",
      title: remoteMessage.notification?.title || 'New Notification',
      message: remoteMessage.notification?.body || 'You have a new message',
      playSound: true,
      soundName: 'default',
      importance: 'max',
      priority: 'max',
      vibrate: true,
      vibration: 300,
      actions: ['View'],
      invokeApp: true,
      userInfo: remoteMessage.data || {},
    });

    // Log notification received
    logEvent('notification_received', {
      title: remoteMessage.notification?.title || 'untitled',
      body_length: remoteMessage.notification?.body?.length || 0,
      has_data: !!remoteMessage.data && Object.keys(remoteMessage.data).length > 0,
      notification_type: 'firebase_push',
    });
  };

  // Test local notification
  const testLocalNotification = (): void => {
    const testTitle = "🧪 Test Notification";
    const testMessage = "If you see this, notifications are working perfectly!";
    
    PushNotification.localNotification({
      channelId: "default_notification_channel",
      title: testTitle,
      message: testMessage,
      playSound: true,
      soundName: 'default',
      importance: 'max',
      priority: 'max',
    });

    logEvent('test_local_notification_sent', {
      triggered_manually: true,
      title: testTitle,
      message_length: testMessage.length,
    });
  };

  useEffect(() => {
    // Initialize everything
    const initializeApp = async () => {
      await initializeAnalytics();
      createNotificationChannel();
      await requestPermission();
    };

    initializeApp();

    // Set background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('🔥 Background notification:', remoteMessage);
      showLocalNotification(remoteMessage);
      
      // Log background notification
      await logEvent('background_notification_received', {
        title: remoteMessage.notification?.title,
        app_state: 'background',
      });
    });

    // Handle notification when app is in foreground
    const unsubscribe = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('📱 Foreground notification received:', remoteMessage);
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        time: new Date().toLocaleTimeString(),
      }]);

      showLocalNotification(remoteMessage);

      Alert.alert(
        '📱 Notification Received', 
        `${remoteMessage.notification?.title}: ${remoteMessage.notification?.body}`
      );

      // Log foreground notification
      await logEvent('foreground_notification_received', {
        title: remoteMessage.notification?.title,
        app_state: 'foreground',
      });
    });

    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('Background notification opened:', remoteMessage);
        logEvent('notification_opened_app', { 
          from_state: 'background',
          title: remoteMessage.notification?.title,
        });
      }
    });

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('Quit state notification opened:', remoteMessage);
          logEvent('notification_opened_app', { 
            from_state: 'quit',
            title: remoteMessage.notification?.title,
          });
        }
      });

    return unsubscribe;
  }, []);

  const copyToken = (): void => {
    if (fcmToken) {
      Alert.alert(
        'Token Ready! 🎯', 
        'FCM Token logged to console. Check your terminal!\n\nUse this token in Firebase Console to send test notifications.'
      );
      console.log('=== COPY THIS TOKEN ===');
      console.log(fcmToken);
      console.log('======================');

      logEvent('fcm_token_copied', {
        token_length: fcmToken.length,
        copied_at: new Date().toISOString(),
      });
    }
  };

  const clearNotifications = (): void => {
    const notificationCount = notifications.length;
    setNotifications([]);
    
    logEvent('notifications_cleared', {
      cleared_count: notificationCount,
      cleared_at: new Date().toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Firebase Complete</Text>
        <Text style={styles.subtitle}>
          Notifications ✅ | Analytics {analyticsInitialized ? '✅' : '⏳'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Analytics Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Analytics Dashboard</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Status: {analyticsInitialized ? '🟢 Active' : '🟡 Initializing...'}
            </Text>
            <Text style={styles.infoText}>
              Events are being tracked automatically. Check Firebase Console for insights!
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.button, {backgroundColor: '#FF6B35'}]} 
            onPress={testAnalytics}
          >
            <Text style={styles.buttonText}>🧪 Test Analytics Event</Text>
          </TouchableOpacity>
        </View>

        {/* Token Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Device Token</Text>
          <Text style={styles.tokenText} numberOfLines={3}>
            {fcmToken || 'Getting token...'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={copyToken}>
            <Text style={styles.buttonText}>📋 Copy Token to Console</Text>
          </TouchableOpacity>
        </View>

        {/* Test Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Test Notifications</Text>
          <TouchableOpacity 
            style={[styles.button, {backgroundColor: '#28a745'}]} 
            onPress={testLocalNotification}
          >
            <Text style={styles.buttonText}>🔔 Test Local Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Testing Guide</Text>
          <Text style={styles.instructionText}>
            <Text style={styles.boldText}>🔥 Push Notifications:</Text>{'\n'}
            1. Copy token above{'\n'}
            2. Firebase Console → Cloud Messaging{'\n'}
            3. Send test message{'\n\n'}
            
            <Text style={styles.boldText}>📊 Analytics Debug:</Text>{'\n'}
            1. Run: adb shell setprop debug.firebase.analytics.app com.pushnotificationdemo{'\n'}
            2. Firebase Console → Analytics → DebugView{'\n'}
            3. Tap buttons to see real-time events!{'\n\n'}
            
            <Text style={styles.boldText}>📈 View Reports:</Text>{'\n'}
            Firebase Console → Analytics → Events & Dashboard
          </Text>
        </View>

        {/* Notifications List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔔 Received Notifications ({notifications.length})</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearNotifications}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>
              No notifications yet.{'\n'}
              Send a test from Firebase Console! 🚀
            </Text>
          ) : (
            notifications.map((notif: NotificationItem) => (
              <View key={notif.id} style={styles.notificationItem}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    backgroundColor: '#4285F4', 
    padding: 20, 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.9)' 
  },
  content: { 
    flex: 1, 
    padding: 16 
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 12 
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  tokenText: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  button: { 
    backgroundColor: '#4285F4', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 8 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  instructionText: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20 
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: { 
    color: '#ff4444', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#999', 
    fontSize: 16, 
    padding: 20,
    lineHeight: 24,
  },
  notificationItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notifTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 4 
  },
  notifBody: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 4 
  },
  notifTime: { 
    fontSize: 12, 
    color: '#999' 
  },
});

export default App;