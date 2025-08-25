
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
import analytics from '@react-native-firebase/analytics'; // 👈 Added

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
}

const App: React.FC = () => {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 🔥 Analytics helper
  const logEvent = async (name: string, params: object = {}) => {
    try {
      await analytics().logEvent(name, params);
      console.log(`📊 Logged event: ${name}`, params);
    } catch (error) {
      console.log('Analytics error:', error);
    }
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
      (created) => console.log(`Channel created: ${created}`)
    );

    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
      onNotification: function (notification) {
        console.log("LOCAL NOTIFICATION ==>", notification);
      },
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
      },
      onRegistrationError: function(err) {
        console.error(err.message, err);
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
    const authStatus = await messaging().requestPermission({
      sound: true,
      announcement: true,
      badge: true,
    });
    
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFCMToken();
    }
  };

  // Get FCM Token
  const getFCMToken = async (): Promise<void> => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setFcmToken(token);

      // 👇 Log to analytics
      logEvent('fcm_token_received', { token });
    } catch (error) {
      console.log('Error getting FCM token:', error);
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

    // 👇 Log to analytics
    logEvent('notification_received', {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
    });
  };

  // Test local notification
  const testLocalNotification = (): void => {
    PushNotification.localNotification({
      channelId: "default_notification_channel",
      title: "🧪 Test Notification",
      message: "If you see this, notifications are working!",
      playSound: true,
      soundName: 'default',
      importance: 'max',
      priority: 'max',
    });

    logEvent('test_local_notification');
  };

  useEffect(() => {
    createNotificationChannel();
    analytics().logAppOpen(); // 👈 Track app open

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('🔥 Background notification:', remoteMessage);
      showLocalNotification(remoteMessage);
    });

    requestPermission();

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
    });

    messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('Background notification opened:', remoteMessage);
        logEvent('notification_opened', { from: 'background' });
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('Quit state notification opened:', remoteMessage);
          logEvent('notification_opened', { from: 'quit' });
        }
      });

    return unsubscribe;
  }, []);

  const copyToken = (): void => {
    if (fcmToken) {
      Alert.alert('Token Ready', 'FCM Token logged to console. Check your terminal!');
      console.log('=== COPY THIS TOKEN ===');
      console.log(fcmToken);
      console.log('======================');

      logEvent('fcm_token_copied');
    }
  };

  const clearNotifications = (): void => {
    setNotifications([]);
    logEvent('notifications_cleared');
  };

  return (
    <SafeAreaView style={styles.container}>      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Firebase Notifications + Analytics</Text>
        <Text style={styles.subtitle}>Channel + Tracking Integrated</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Token Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Device Token</Text>
          <Text style={styles.tokenText} numberOfLines={3}>
            {fcmToken || 'Getting token...'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={copyToken}>
            <Text style={styles.buttonText}>Copy Token to Console</Text>
          </TouchableOpacity>
        </View>

        {/* Test Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Test Notifications</Text>
          <TouchableOpacity style={[styles.button, {backgroundColor: '#28a745'}]} onPress={testLocalNotification}>
            <Text style={styles.buttonText}>Test Local Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔔 Received Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearNotifications}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications yet. Send a test!</Text>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4285F4', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  content: { flex: 1, padding: 16 },
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  tokenText: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  button: { backgroundColor: '#4285F4', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  clearText: { color: '#ff4444', fontSize: 14, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16, padding: 20 },
  notificationItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notifTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  notifBody: { fontSize: 14, color: '#666', marginBottom: 4 },
  notifTime: { fontSize: 12, color: '#999' },
});

export default App;
