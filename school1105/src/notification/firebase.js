import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { localurl } from "../api/api";

const firebaseConfig = {
  apiKey: "AIzaSyCOS79uU38mvZZjfXcFgUsQPtLF6-8_GZA",
  authDomain: "notification-8fbf2.firebaseapp.com",
  projectId: "notification-8fbf2",
  storageBucket: "notification-8fbf2.firebasestorage.app",
  messagingSenderId: "569228179120",
  appId: "1:569228179120:web:73c64dcfd249ea36ef6d75",
  measurementId: "G-FKVN137VCJ",
};

const app = initializeApp(firebaseConfig);

// ✅ Check if messaging is supported before initializing
export const messaging = (await isSupported()) ? getMessaging(app) : null;

export const generateToken = async () => {
  try {
    const user_id = localStorage.getItem("user_id");
    const role = localStorage.getItem("authRole");
    const school_id = localStorage.getItem("school_id");

    if (!user_id || !role || !school_id) {
      console.log("❌ user not logged in or school_id missing");
      return;
    }

    if (!messaging) {
      console.log("❌ Messaging not supported (likely insecure origin)");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BL96YuOwILI5NnEOslOeNX38vqoq2sCCRRZhM7-pM2MTsoG86U0JG7Xjj1ZzA1FNhrGwoysinZromKZnwG-_hR0",
      });

      console.log("FCM Token:", token);

      localStorage.setItem("fcm_token", token);

      const response = await fetch(`${localurl}flutter_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school_id,
          user_id,
          token,
          type: role === "admin" ? "employee" : role,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("✅ Token saved to backend:", data.message);
      } else {
        console.error("❌ Failed to save token:", data.message);
      }
    } else {
      console.log("❌ Notification permission denied");
    }
  } catch (error) {
    console.log("ERROR 👉", error);
  }
};