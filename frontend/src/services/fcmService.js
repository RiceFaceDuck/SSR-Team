import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../config/firebase';

export const requestNotificationPermission = async (userId) => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE', // The user will need to replace this
      });

      if (token) {
        // Save token to Firestore
        const tokenRef = doc(db, `users/${userId}/private`, 'fcm_tokens');
        await setDoc(tokenRef, { [token]: true }, { merge: true });
        console.log('FCM Token generated and saved.');
      }
    }
  } catch (error) {
    console.error('Failed to request notification permission:', error);
  }
};

export const listenForForegroundMessages = (callback) => {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      if (callback) callback(payload);
    });
  } catch (error) {
    console.warn('FCM messaging not supported or failed to init:', error);
    return () => {};
  }
};
