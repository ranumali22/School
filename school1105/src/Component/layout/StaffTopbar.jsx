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
    <div className="h-[74px] md:h-16 bg-[#0860C4] shadow-md flex items-center justify-between px-4 md:px-6 relative z-[100] pt-2 md:pt-0 w-full">
      <div className="flex items-center gap-4">
        <Menu
          className="mobile-menu-btn text-white cursor-pointer active:scale-95 transition-transform"
          onClick={() => setMobileOpen((prev) => !prev)}
          size={24}
        />

        <h1
          className="!text-white !text-[15px] md:!text-[18px] !font-black !tracking-tight !uppercase hidden md:block"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {school?.school_name || "School Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* NOTIFICATION */}
        <div className="relative">
          {/* 🔔 BELL */}
          <div
            className="relative cursor-pointer p-2 rounded-full hover:bg-white/20 transition"
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen(!notifOpen);
            }}
          >
            <Bell className="text-white" size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full shadow">
                {unreadCount}
              </span>
            )}
          </div>

          {/* 🔽 DROPDOWN */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] md:w-96 bg-white shadow-2xl rounded-2xl overflow-hidden z-50 border">
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

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-white font-medium capitalize hidden sm:block">
              {user?.name?.toLowerCase() || "Staff"}
            </span>

            <img
              src={
                rawUser?.employeePhoto
                  ? `${imageBase}uploads/employee/${rawUser.employeePhoto}`
                  : "/default-user.png"
              }
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/20 shadow-sm"
            />
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-64 bg-white shadow-xl rounded-xl p-4 border z-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold">
                  {(user?.name || "S")[0]}
                </div>

                <div>
                  <p className="font-semibold text-gray-800 capitalize">
                    {user?.name?.toLowerCase()}
                  </p>

                  <p className="text-xs text-gray-500">ID: {user?.loginid}</p>

                  <p className="text-xs text-gray-500">
                    Session : {session_name || "N/A"}
                  </p>

                  <p className="text-xs text-gray-500">
                    School Code : {school_id || "N/A"}
                  </p>
                </div>
              </div>

              <hr className="mb-3" />

              <button
                onClick={() => {
                  navigate("/staff-profile"); // 🔥 IMPORTANT CHANGE
                  setOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                👤 My Profile
              </button>

              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTopbar;
