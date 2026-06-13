import React, { useState, useEffect, useRef } from "react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { localurl } from "../../api/api";
const imageBase = localurl.replace("/api", "");

const StaffTopbar = ({ setMobileOpen }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const navigate = useNavigate();
  // const user = JSON.parse(localStorage.getItem("authData") || "{}");
  const session_name = localStorage.getItem("session_name");
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");

  const unreadCount = notifications.filter(
    (n) => n.read_status !== "read",
  ).length;

  const rawUser = JSON.parse(localStorage.getItem("authData") || "{}");

  const user = {
    name: rawUser?.employeeFullName,
    loginid: rawUser?.loginid || rawUser?.employee_id || "N/A",
    role: rawUser?.designation || rawUser?.role || "Staff",
  };

  const [school, setSchool] = useState(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        if (!school_id) return;
        const res = await fetch(`${localurl}profile_school/${school_id}`);
        const data = await res.json();
        if (data.success) {
          setSchool(data.row?.[0] || data.row);
        }
      } catch (err) {
        console.error("SCHOOL ERROR:", err);
      }
    };
    fetchSchool();
  }, [school_id]);

  useEffect(() => {
    if (!school_id || !session_id) return;

    const deptId = rawUser?.department || "";

    fetch(
      `${localurl}notification/${school_id}/${session_id}?type=staff&department_id=${deptId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.row || []);
        }
      });
  }, [school_id, session_id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setNotifOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="h-16 bg-[#0860C4] shadow-md flex items-center justify-between px-6 sticky top-0 z-[100]">
      <div className="flex items-center ">
        <Menu
          className="mobile-menu-btn text-white cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setMobileOpen(true)}
          size={20}
        />

        <h1
          className="topbar-school-name !text-white uppercase"
          className="!text-white !text-[20px]  !uppercase "

        >
          {school?.school_name || "School Dashboard"}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <div className="relative cursor-pointer group flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors">
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen(!notifOpen);
            }}
          >
            <Bell className="text-white" size={20} />
          </div>

          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-[#0860C4] px-1">
              {unreadCount}
            </span>
          )}
          {notifOpen && (
            <div className="absolute  -right-10 top-full mt-2 w-[320px] max-w-[95vw] md:w-[380px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-[9999] border border-gray-100 animate-in fade-in zoom-in duration-200">
              {/* HEADER */}
              <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>

                <button
                  onClick={() => {
                    fetch(`${localurl}read_notification`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        type: "all",
                      }),
                    });

                    setNotifications((prev) =>
                      prev.map((item) => ({ ...item, read_status: "read" })),
                    );
                  }}
                >
                  Mark all read
                </button>
              </div>

              {/* LIST */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        // 🔥 NAVIGATE WITH SELECTED NOTIFICATION
                        navigate("/staff/notification-pannel", {
                          state: { selectedNotification: n },
                        });

                        // 🔥 MARK AS READ
                        if (n.read_status !== "read") {
                          fetch(`${localurl}read_notification`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              id: n.id,
                              type: "single",
                            }),
                          });

                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === n.id
                                ? { ...item, read_status: "read" }
                                : item,
                            ),
                          );
                        }

                        setNotifOpen(false);
                      }}
                      className={`flex gap-3 px-4 py-3 border-b cursor-pointer transition
           ${selectedNotif?.id === n.id
                          ? "bg-blue-100"
                          : n.read_status !== "read"
                            ? "bg-blue-50"
                            : "bg-white"
                        }
           hover:bg-gray-100`}
                    >
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        🔔
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {n.title || "Notification"}
                        </p>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {n.messages}
                        </p>

                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.date).toLocaleString()}
                        </p>
                      </div>

                      {n.read_status !== "read" && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {selectedNotif && (
                <div className="fixed right-5 top-20 w-[400px] bg-white shadow-xl rounded-xl p-5 border z-50">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    {selectedNotif.title}
                  </h3>

                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(selectedNotif.date).toLocaleString()}
                  </p>

                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedNotif.messages}
                  </div>

                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                  >
                    Close
                  </button>
                </div>
              )}

              <div className="text-center py-2 border-t bg-gray-50">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    navigate("/staff/notification-pannel");
                    setNotifOpen(false);
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <img
              src={
                rawUser?.employeePhoto
                  ? `${imageBase}uploads/employee/${rawUser.employeePhoto}`
                  : "/default-user.png"
              }
              className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm"
            />

            <span className="text-white font-bold text-[13px] hidden lg:block">
              {user?.name || "Staff"}
            </span>
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white shadow-2xl rounded-2xl p-4 border border-slate-100 z-50 animate-in fade-in zoom-in duration-200">
              {/* USER INFO */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-[#0860C4] text-white flex items-center justify-center rounded-full font-black text-sm">
                  {user?.name?.[0] || "S"}
                </div>

                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 text-[13px] leading-tight truncate">
                    {user?.name || "Staff"}
                  </p>

                  <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">
                    {user?.role || "Staff Member"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 mb-3" />

              {/* MENU */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    navigate("/staff-profile");
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-slate-700 font-semibold text-[13px] hover:bg-slate-50 hover:text-[#0860C4] transition-all group"
                >
                  <UserCircle className="text-slate-400 group-hover:text-[#0860C4]" size={16} />
                  <span>Staff Profile</span>
                </button>

                <div className="h-px bg-slate-50 my-1.5" />

                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-red-500 font-bold text-[13px] hover:bg-red-50 transition-all group"
                >
                  <div className="text-red-400 group-hover:text-red-500">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="16" width="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTopbar;
