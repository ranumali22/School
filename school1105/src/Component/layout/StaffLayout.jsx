import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";
import StaffTopbar from "./StaffTopbar";
import StaffBottomBar from "./StaffBottomBar";
import { registerPushNotifications } from "../../utils/pushNotifications";

const StaffLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = localStorage.getItem("authRole");
  const staff_id = localStorage.getItem("staff_id");

  useEffect(() => {
    if (staff_id) {
      registerPushNotifications(staff_id, "staff");
    }
  }, [staff_id]);

  if (role !== "staff") {
    return <Navigate to="/" replace />;
  }

  // return children;
  return (
    <div className="layout">
      <StaffSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="main-content">
        <StaffTopbar setMobileOpen={setMobileOpen} />
        <div className="page-content">
          {children}
        </div>
      </div>

      <StaffBottomBar />
    </div>
  );
};

export default StaffLayout;