import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "../../pages/auth/ChangePassword";

const SuperAdminTopbar = ({ setMobileOpen }) => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [openPassword, setOpenPassword] = useState(false);

  const logout = () => {

    localStorage.removeItem("authRole");
    localStorage.removeItem("authData");

    navigate("/");
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <div className="h-16 bg-[#0860C4] shadow flex items-center justify-between px-6 relative">

      <Menu className="mobile-menu-btn text-white" onClick={() => setMobileOpen(true)} />

      {/* Title */}
      <h1 className="text-xl font-semibold text-white">
       EGYANPATH MANAGEMENT ERP
      </h1>
      {/* <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
        <span>Session : 2025-26</span>
        <span>|</span>
        <span>School Code : 2072</span>
      </div> */}
      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell className="text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <UserCircle size={30} className="text-white" />
            <span className="text-white font-medium">SuperAdmin</span>
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl p-4 border z-50">

              {/* USER INFO */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold">
                  {JSON.parse(localStorage.getItem("authData"))?.name?.[0] || "A"}
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {JSON.parse(localStorage.getItem("authData"))?.name || "Admin"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {JSON.parse(localStorage.getItem("authData"))?.email}
                  </p>
                </div>
              </div>

              <hr className="mb-3" />

              {/* MENU */}
              {/* MENU */}
              <button
                onClick={() => {
                  navigate("/admin-profile");
                  setOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition"
              >
                👤 Admin Profile
              </button>

              <button
                onClick={() => {
                  setOpenPassword(true);
                  setOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition"
              >
                🔒 Change Password
              </button>

              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded transition"
              >
                🚪 Logout
              </button>

            </div>
          )}

        </div>

      </div>
      {openPassword && (
        <ChangePasswordModal onClose={() => setOpenPassword(false)} />
      )}
    </div>
  );
};

export default SuperAdminTopbar;