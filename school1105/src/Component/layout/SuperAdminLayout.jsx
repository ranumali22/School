import { useState } from "react";

import { Navigate } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

const SuperAdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);


  return (
    <div className="flex h-screen overflow-hidden">

      <SuperAdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">

        <SuperAdminTopbar setMobileOpen={setMobileOpen} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-100">
          {children}
        </div>

      </div>
    </div>

  );
};

export default SuperAdminLayout;