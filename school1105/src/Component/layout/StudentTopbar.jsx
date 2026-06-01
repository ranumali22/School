import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { localurl } from "../../api/api";
const imageBase = localurl.replace("/api", "");
const StudentTopbar = ({ setMobileOpen }) => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [school, setSchool] = useState(null);
  const [sessionNameStr, setSessionNameStr] = useState(localStorage.getItem("session_name") || "N/A");

  const unreadCount = notifications.filter(
    (n) => n.read_status !== "read",
  ).length;
  const user = JSON.parse(localStorage.getItem("authData") || "{}");
  const session_name = localStorage.getItem("session_name");
  const school_id = localStorage.getItem("school_id");
  const student_id = localStorage.getItem("student_id");
  const session_id = localStorage.getItem("session_id");

  useEffect(() => {
    if (!student_id) return;

    fetch(`${localurl}student/${student_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudent(data.data);

          // optional sync
          localStorage.setItem("session_id", data.data.session_id);
          localStorage.setItem("school_id", data.data.school_id);
          localStorage.setItem("class_id", data.data.registerClass); // ✅ Save class/section ID
        }
      })
      .catch((err) => console.error(err));
  }, [student_id]);

  useEffect(() => {
    if (!school_id) return;

    fetch(`${localurl}notification/${school_id}/${session_id}?type=user`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // ✅ ONLY SENT NOTIFICATIONS
          const sentNotifications = (data.row || []).filter(
            (n) => n.status === "Sent",
          );
          setNotifications(data.row || []);
        }
      });
  }, [school_id]);

  useEffect(() => {
    const handleSync = (e) => {
      const { id } = e.detail;
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read_status: "read" } : item))
      );
    };

    window.addEventListener("notificationRead", handleSync);
    return () => window.removeEventListener("notificationRead", handleSync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!school_id) return;
    fetch(`${localurl}all_school`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.row && data.row.length > 0) {
          const currentSchool = data.row.find((s) => String(s.id) === String(school_id)) || data.row[0];
          setSchool(currentSchool);
        }
      })
      .catch((err) => console.error(err));
  }, [school_id]);

  useEffect(() => {
    const sName = localStorage.getItem("session_name");
    if (sName && sName !== "") {
      setSessionNameStr(sName);
      return;
    }
    if (!school_id || !session_id) return;

    fetch(`${localurl}session/${school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.row) {
          const currentSession = data.row.find((s) => String(s.id) === String(session_id));
          if (currentSession) {
            setSessionNameStr(currentSession.session_name);
            localStorage.setItem("session_name", currentSession.session_name);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [school_id, session_id]);

  // ✅ logout
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="h-[74px] md:h-16 bg-[#0860C4] shadow-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-[100] pt-2 md:pt-0 w-full">
      <div className="flex items-center gap-4">
        <Menu
          className="mobile-menu-btn text-white cursor-pointer active:scale-95 transition-transform"
          onClick={() => setMobileOpen((prev) => !prev)}
          size={24}
        />

        {/* School Logo & Title */}
        <div className="hidden md:flex items-center gap-3">
          {school?.upload_logo && (
            <img
              src={`${imageBase}uploads/employee/${school.upload_logo}`}
              alt="School Logo"
              className="w-10 h-10 object-contain rounded-full bg-white p-1 shrink-0 border border-white/20"
            />
          )}
          <h1
            className="topbar-school-name !text-white !text-[16px] md:!text-[18px] !font-black !tracking-tight !uppercase line-clamp-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {school?.school_name || "Student Dashboard"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* NOTIFICATION */}
        <div className="relative">
          {/* 🔔 BELL */}
          <div
            className="relative cursor-pointer p-2 rounded-full hover:bg-white/20 transition"
            onClick={() => {
              if (window.innerWidth < 768) {
                navigate("/notification-pannel");
              } else {
                setNotifOpen(!notifOpen);
              }
            }}
          >
            <Bell className="text-white" size={24} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full shadow">
                {unreadCount}
              </span>
            )}
          </div>

          {/* 🔽 PREMIUM DROPDOWN */}
          {notifOpen && (
            <div className="absolute right-0 mt-4 w-[calc(100vw-32px)] md:w-[380px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-50 border border-gray-100 animate-in fade-in zoom-in duration-200">
              {/* HEADER */}
              <div className="flex justify-between items-center px-5 py-4 border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    fetch(`${localurl}read_notification`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "all", school_id, session_id }),
                    });
                    setNotifications((prev) =>
                      prev.map((item) => ({ ...item, read_status: "read" })),
                    );
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  Mark all read
                </button>
              </div>

              {/* LIST */}
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Bell className="text-gray-300" size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        navigate("/notification-pannel", { state: { selectedNotification: n } });
                        if (n.read_status !== "read") {
                          fetch(`${localurl}read_notification`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: n.id, type: "single" }),
                          });
                          setNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, read_status: "read" } : item))
                          );
                        }
                        setNotifOpen(false);
                      }}
                      className={`group flex gap-4 px-5 py-4 border-b border-gray-50 cursor-pointer transition-all duration-200
                        ${n.read_status !== "read" ? "bg-blue-50/40 hover:bg-blue-50/70" : "bg-white hover:bg-gray-50"}`}
                    >
                      {/* ICON STRATEGY */}
                      <div className={`h-11 w-11 shrink-0 flex items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105
                        ${n.read_status !== "read" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Bell size={20} fill={n.read_status !== "read" ? "currentColor" : "none"} />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm leading-tight truncate ${n.read_status !== "read" ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                            {n.title || "School Notification"}
                          </p>
                          {n.read_status !== "read" && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full mt-1.5 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                          {n.messages}
                        </p>

                        <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          {new Date(n.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER */}
              <div className="p-3 border-t bg-gray-50/50">
                <button
                  className="w-full py-2.5 text-sm font-bold text-blue-600 bg-white border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all duration-200"
                  onClick={() => {
                    navigate("/notification-pannel");
                    setNotifOpen(false);
                  }}
                >
                  See All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-white font-medium hidden md:inline">
              {student?.studentName || "Student"}
            </span>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-white/20 shrink-0 shadow-sm flex items-center justify-center">
              <img
                src={
                  student?.photo
                    ? `${imageBase}uploads/student/${student.photo}`
                    : "/default-user.png"
                }
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>

            {/* ✅ NAME */}
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-64 bg-white shadow-xl rounded-xl p-4 border z-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold">
                  {(student?.studentName || "S")[0]}
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {student?.studentName || student?.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    ID: {student?.loginid || student?.loginId}
                  </p>

                  <p className="text-xs text-gray-500">
                    Session : {sessionNameStr}
                  </p>
                  <p className="text-xs text-gray-500">
                    School Code : {school_id || "N/A"}
                  </p>
                </div>
              </div>

              <hr className="mb-3" />

              {/* MENU */}
              <button
                onClick={() => {
                  navigate("/student-profile");
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

export default StudentTopbar;
