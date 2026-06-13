import React, { useState } from "react";
import { useRef, useEffect } from "react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "../../pages/auth/ChangePassword";
import { get_school } from "../../Api";
import { localurl } from "../../api/api";

const Topbar = ({ setMobileOpen }) => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [openPassword, setOpenPassword] = useState(false);
  const [school, setSchool] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const logout = () => {
    localStorage.clear();


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

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("authData") || "{}");

    if (data?.id) {
      setSchool(data);
    }
  }, []);

  useEffect(() => {

  const handleProfileUpdate = () => {
    const data = JSON.parse(
      localStorage.getItem("authData") || "{}"
    );

    setSchool(data);
  };

  window.addEventListener(
    "profileUpdated",
    handleProfileUpdate
  );

  return () => {
    window.removeEventListener(
      "profileUpdated",
      handleProfileUpdate
    );
  };

}, []);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await get_school();
        const data = res.data;

        console.log("SCHOOL:", data);

        // ⚠️ agar array aa raha hai
        if (data && data.length > 0) {
          setSchool(data[0]); // first school
        }
      } catch (err) {
        console.error("SCHOOL ERROR:", err);
      }
    };

    fetchSchool();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const school_id = localStorage.getItem("school_id");

        const res = await fetch(localurl + `session/${school_id}`);
        const data = await res.json();

        if (data.success) {


          const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split("/");
            return new Date(`${year}-${month}-${day}`);
          };

          const activeData = data.row.filter(
            (item) => item.session_status === "Active"
          );

          const sorted = activeData.sort(
            (a, b) => parseDate(b.start_date) - parseDate(a.start_date)
          );

          const latest = sorted[0];

          setSessions(sorted);

          const savedSession = JSON.parse(localStorage.getItem("session_data"));

          if (savedSession) {
            setSelectedSession(savedSession);
            localStorage.setItem("session_id", savedSession.id);
          } else {
            setSelectedSession(latest);

            localStorage.setItem("session_data", JSON.stringify(latest));
            localStorage.setItem("session_id", latest.id);
          }
        }
      } catch (err) {
        console.error("SESSION ERROR:", err);
      }
    };

    fetchSession();
  }, []);


useEffect(() => {
  const handleSessionChange = async () => {
    const school_id = localStorage.getItem("school_id");

    const res = await fetch(localurl + `session/${school_id}`);
    const data = await res.json();

    if (data.success) {
      const activeData = data.row.filter(
        (item) => item.session_status === "Active"
      );

      setSessions(activeData);

      const savedSession = JSON.parse(
        localStorage.getItem("session_data")
      );

      if (savedSession) {
        const updatedSession = activeData.find(
          (s) => s.id == savedSession.id
        );

        if (updatedSession) {
          setSelectedSession(updatedSession);

          localStorage.setItem(
            "session_data",
            JSON.stringify(updatedSession)
          );
        }
      }
    }
  };

  window.addEventListener(
    "sessionChanged",
    handleSessionChange
  );

  return () =>
    window.removeEventListener(
      "sessionChanged",
      handleSessionChange
    );
}, []);

  return (
    <div className="h-16 bg-[#0860C4] shadow-md flex items-center justify-between px-6 sticky top-0 z-[100]">
      <div className="flex items-center gap-5">
        <Menu
          className="mobile-menu-btn text-white cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setMobileOpen(true)}
          size={20}
        />

        {/* Title */}
        <h1
          className="!text-white !text-[20px]  !uppercase "
        // style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {school?.school_name || "School Dashboard"}
        </h1>
      </div>

      <div className="hidden md:flex items-center text-white/90 text-[12px] font-medium gap-6">
        <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 relative min-w-[120px]">
          <span className="text-[10px] font-bold text-white whitespace-nowrap">Session :</span>
          <div className="relative flex items-center flex-1">
            <span className="text-white font-semibold text-[12px] pr-4 whitespace-nowrap">
              {selectedSession?.session_name || "Select"}
            </span>
            <select
              value={selectedSession?.id ? String(selectedSession.id) : ""}
              onChange={(e) => {
                const selected = sessions.find(
                  (s) => String(s.id) === e.target.value,
                );

                if (selected) {
                  setSelectedSession(selected);
                  localStorage.setItem("session_id", selected.id);
                  localStorage.setItem("session_data", JSON.stringify(selected));
                  // window.location.href = "/dashboard";
                  navigate("/dashboard");

                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} className="text-black text-sm">
                  {s.session_name}
                </option>
              ))}
            </select>
            <div className="absolute right-0 pointer-events-none">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <div className="relative cursor-pointer group flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors">
          <Bell className="text-white" size={20} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-[#0860C4] px-1">
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
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <img
              src={
                school?.upload_logo
                  ? school.upload_logo.startsWith("data:")
                    ? school.upload_logo
                    : `${import.meta.env.VITE_SERVER_URL}/uploads/${school.upload_logo}`
                  : "/default-school.png"
              }
              className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm"
            />

            <span className="text-white font-bold text-[13px] hidden lg:block">
              {school?.name || "Admin"}
            </span>
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white shadow-2xl rounded-2xl p-4 border border-slate-100 z-50 animate-in fade-in zoom-in duration-200">
              {/* USER INFO */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-[#0860C4] text-white flex items-center justify-center rounded-full font-black text-sm">
                  {school?.school_name?.[0] || "A"}
                </div>

                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 text-[13px] leading-tight truncate">
                    {school?.school_name || "Admin"}
                  </p>

                  <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">
                    {school?.email || "admin@gmail.com"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 mb-3" />

              {/* MENU */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    navigate("/admin-profile");
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-slate-700 font-semibold text-[13px] hover:bg-slate-50 hover:text-[#0860C4] transition-all group"
                >
                  <UserCircle className="text-slate-400 group-hover:text-[#0860C4]" size={16} />
                  <span>Admin Profile</span>
                </button>

                <button
                  onClick={() => {
                    setOpenPassword(true);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-slate-700 font-semibold text-[13px] hover:bg-slate-50 hover:text-[#0860C4] transition-all group"
                >
                  <div className="text-slate-400 group-hover:text-[#0860C4]">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="16" width="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <span>Change Password</span>
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
      {openPassword && (
        <ChangePasswordModal onClose={() => setOpenPassword(false)} />
      )}
    </div>
  );
};

export default Topbar;
