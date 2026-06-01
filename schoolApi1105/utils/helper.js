const { create, getAll, update } = require("../model/school_account"); // Ensure 'create' is imported

const admin = require("firebase-admin");


//fee
const sendNotificationHelper = async (notification_id) => {
  try {
    if (!notification_id) {
      console.log("❌ Invalid notification id");
      return;
    }

    console.log("NOTIFICATION ID 👉", notification_id);

    const result = await getAll("notification", "*", {
      id: notification_id,
      delete_status: "show",
    });

    console.log("DB RESULT 👉", result);

    const notification = result?.[0];

    if (!notification) {
      console.log("❌ Notification not found");
      return;
    }

    let users = await getAll("students", "*", {
      id: notification.student_id,
    });

    const tokens = users.map(u => u.fcm_token).filter(Boolean);

    console.log("TOKENS 👉", tokens);

    if (tokens.length === 0) {
      console.log("❌ No tokens found");
      return;
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.messages,
      },
    });

    console.log("FIREBASE RESPONSE 👉", response);

    await update("notification", { status: "Sent" }, notification_id);

    console.log("✅ STATUS UPDATED");
  } catch (err) {
    console.log("❌ HELPER ERROR 👉", err.message);
  }
};


const sendAttendanceNotification = async (student_id, attendance_date, status) => {
  try {
    const studentData = await getAll("students", "*", { id: student_id });
    const student = studentData?.[0];

    if (!student) return;

    const schoolData = await getAll("school_account", "*", { id: student.school_id });
    const school = schoolData?.[0];

    const schoolName = school?.school_name || "School";
    const title = `${schoolName} - Attendance Update`;
    const messageBody = `Hi ${student.studentName}, your attendance for ${attendance_date} has been marked as ${status}.`;


    const notificationData = {
      school_id: student.school_id,
      session_id: student.session_id,
      student_id: student.id,
      title: title,
      messages: messageBody,
      Send_to: "Single",
      status: "Sent",
      read_status: "unread",
      date: new Date(),
      delete_status: "show"
    };

    await create("notification", notificationData);

    // --- 2. PUSH NOTIFICATION BHEJEIN (Firebase) ---
    if (student.fcm_token) {
      await admin.messaging().send({
        token: student.fcm_token,
        notification: {
          title: title,
          body: messageBody,
        }
      });
      console.log("✅ Push & DB Notification Sent");
    }

  } catch (err) {
    console.log("❌ NOTIFICATION ERROR:", err.message);
  }
};





module.exports = { sendNotificationHelper, sendAttendanceNotification };;