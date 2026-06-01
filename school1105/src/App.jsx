import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { messaging } from "./notification/firebase";
import { onMessage } from "firebase/messaging";
import toast, { Toaster } from "react-hot-toast";
import { localurl } from "./api/api";

function App() {



  useEffect(() => {

    window.onFlutterToken = function (token) {
      console.log("Token from Flutter:", token);

      fetch(localurl + "flutter_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });
    };


    console.log("APP LOADED ✅");

    // ✅ SERVICE WORKER REGISTER
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => console.log("✅ SW registered"))
        .catch((err) => console.log("❌ SW error:", err));
    }

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log("📩 Foreground:", payload);

        const title =
          payload?.notification?.title || payload?.data?.title || "E-GyanPath";

        const body =
          payload?.notification?.body ||
          payload?.data?.body ||
          "New Notification";

        // ✅ TOAST
        toast(body);
        window.dispatchEvent(new Event("new-notification"));
        // ✅ SYSTEM NOTIFICATION
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/logo192.png",
          });
        }
      });
    }
  }, []);

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;
