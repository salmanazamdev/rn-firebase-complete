package com.pushnotificationdemo

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

// Android notification imports
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import android.os.Bundle
import android.graphics.Color

class MainActivity : ReactActivity() {
  
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "pushnotificationdemo"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flag.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Create notification channel for Android 8.0+ devices
   */
  override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      createNotificationChannel()
  }

  private fun createNotificationChannel() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          // Channel ID must match the one in AndroidManifest.xml
          val channelId = "default_notification_channel"
          val channelName = "General Notifications"
          val channelDescription = "Notifications for general app updates"
          val importance = NotificationManager.IMPORTANCE_HIGH
          
          val channel = NotificationChannel(channelId, channelName, importance).apply {
              description = channelDescription
              
              // Enable lights
              enableLights(true)
              lightColor = Color.BLUE
              
              // Enable vibration
              enableVibration(true)
              vibrationPattern = longArrayOf(0, 1000, 500, 1000)
              
              // Enable sound (default system sound)
              setSound(null, null) // Use default sound
          }
          
          // Register the channel with the system
          val notificationManager: NotificationManager =
              getSystemService(NotificationManager::class.java)
          notificationManager.createNotificationChannel(channel)
          
          // Log for debugging
          android.util.Log.d("MainActivity", "Notification channel created: $channelId")
      }
  }
}