import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { localurl } from '../api/api';

/**
 * Registers for push notifications and saves the token to the backend
 * @param {string} userId - The logged in user's ID
 * @param {string} role - The user's role (student/staff)
 */
export const registerPushNotifications = async (userId, role) => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications not supported on web/browser.');
    return;
  }

  const school_id = localStorage.getItem('school_id');

  try {
    // 1. Request permission
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('User denied push notification permissions.');
      return;
    }

    // 2. Create Notification Channel (CRITICAL for Android Pop-ups)
    try {
      await PushNotifications.createChannel({
        id: 'school_notifications',
        name: 'School Notifications',
        description: 'General notifications from school',
        importance: 5, // High importance for pop-ups
        visibility: 1,
        sound: 'default',
        vibration: true,
      });
    } catch (channelErr) {
      console.error('Error creating notification channel:', channelErr);
    }

    // 3. Set Presentation Options (To show pop-up while app is open)
    await PushNotifications.setPresentationOptions({
      presentationOptions: ['badge', 'sound', 'alert'],
    });

    // 4. Register for token
    await PushNotifications.register();

    // 5. On registration success
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value);
      try {
        await fetch(`${localurl}save_fcm_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school_id,
            user_id: userId,
            role: role,
            fcm_token: token.value
          })
        });
      } catch (err) {
        console.error('Error saving FCM token:', err);
      }
    });

    // 6. Handle registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // 7. Handle notification received (Foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received (Foreground):', notification);
      // Even with presentationOptions, some devices need a manual trigger or at least logging
    });

    // 8. Handle action
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
    });

  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};
