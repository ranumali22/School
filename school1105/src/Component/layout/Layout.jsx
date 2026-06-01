import { useState } from "react";
import Sidebar from "./AdminSidebar";
import Topbar from "./AdminTopbar";
import { Navigate } from "react-router-dom";
const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = localStorage.getItem("authRole");

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // return children;
  return (

    <div className="flex h-screen overflow-hidden">

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar setMobileOpen={setMobileOpen} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-100">
          {children}
        </div>

      </div>

    </div>

  );
};

export default Layout;