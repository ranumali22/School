const admin = require("../config/firebaseAdmin");

/**
 * Send Push Notification to multiple tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {object} payload - Notification payload { title, body, data }
 */
const sendPushNotification = async (tokens, payload) => {
  if (!tokens || tokens.length === 0) return;

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
    android: {
      priority: "high",
      notification: {
        channelId: "school_notifications", 
        sound: "default",
        priority: "high",
        visibility: "public",
        defaultSound: true,
        defaultVibrateTimings: true,
        notificationPriority: "high",
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
        importance: "max", // Force high importance for pop-up
        ticker: "New school notification",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages.`);
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.log("Failed tokens:", failedTokens);
    }
  } catch (error) {
    console.error("Error sending push notification ❌:", error);
  }
};

module.exports = { sendPushNotification };
