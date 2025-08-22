// App.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
}

const App: React.FC = () => {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
      
      // Save this token to your backend/database
      // sendTokenToServer(token);
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };

  useEffect(() => {
    // Request permission when app loads
    requestPermission();

    // Handle notification when app is in foreground
    const unsubscribe = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground notification:', remoteMessage);
      
      // Add notification to list
      setNotifications(prev => [...prev, {
        id: Date.now(),
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        time: new Date().toLocaleTimeString(),
      }]);

      // Show alert
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new message'
      );
    });

    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('Background notification opened:', remoteMessage);
        Alert.alert('Opened from notification!', JSON.stringify(remoteMessage.notification));
      }
    });

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('Quit state notification:', remoteMessage);
          Alert.alert('Opened from quit state!', JSON.stringify(remoteMessage.notification));
        }
      });

    return unsubscribe;
  }, []);

  const copyToken = (): void => {
    if (fcmToken) {
      // In a real app, you'd use Clipboard API
      Alert.alert('Token Ready', 'FCM Token logged to console. Check your terminal!');
      console.log('=== COPY THIS TOKEN ===');
      console.log(fcmToken);
      console.log('======================');
    }
  };

  const clearNotifications = (): void => {
    setNotifications([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 Firebase Notifications</Text>
        <Text style={styles.subtitle}>Simple & Clean Setup</Text>
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

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Test Instructions</Text>
          <Text style={styles.instructionText}>
            1. Copy the token above{'\n'}
            2. Go to Firebase Console → Cloud Messaging{'\n'}
            3. Click "Send your first message"{'\n'}
            4. Paste your token in "FCM registration token"{'\n'}
            5. Send test notification!
          </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4285F4',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  clearText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    padding: 20,
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
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default App;