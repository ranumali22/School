import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import StudentBottomBar from "./StudentBottomBar";
import { registerPushNotifications } from "../../utils/pushNotifications";

const StudentLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = localStorage.getItem("authRole");
  const student_id = localStorage.getItem("student_id");

  useEffect(() => {
    if (student_id) {
      registerPushNotifications(student_id, "student");
    }
  }, [student_id]);

  if (role !== "student") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="layout">
      <StudentSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="main-content">
        <StudentTopbar setMobileOpen={setMobileOpen} />

        <div className="page-content">
          {children}
        </div>
      </div>

      <StudentBottomBar />
    </div>
  );
};

export default StudentLayout;
