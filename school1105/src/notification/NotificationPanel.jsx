import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { localurl } from "../api/api";
import {
  FaBell,
  FaEnvelopeOpen,
  FaRegCalendarAlt,
  FaUserShield,
  FaInbox,
  FaChevronRight,
  FaBullhorn
} from "react-icons/fa";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const { state } = useLocation();

  const role = localStorage.getItem("authRole");
  const rawUser = JSON.parse(localStorage.getItem("authData") || "{}");

  // Parse school data from localStorage
  const schoolData = JSON.parse(localStorage.getItem("school") || "{}");
  const schoolName = schoolData.school_name || "Notification Center";
  const schoolLogo = schoolData.upload_logo || localStorage.getItem("school_logo");
  const schoolAddress = schoolData.school_address || schoolData.address;

  const fallbackLogo = "https://cdn-icons-png.flaticon.com/512/2913/2913045.png";

  useEffect(() => {
    if (notifications.length > 0) {
      if (state?.selectedNotification) {
        const found = notifications.find((n) => n.id === state.selectedNotification.id);
        setSelected(found || notifications[0]);
      } else if (!selected) {
        setSelected(notifications[0]);
      }
    }
  }, [notifications]);

  useEffect(() => {
    if (selected && selected.read_status !== "read") {
      fetch(`${localurl}read_notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, type: "single" }),
      });

      setNotifications((prev) =>
        prev.map((item) => (item.id === selected.id ? { ...item, read_status: "read" } : item))
      );

      // 🔥 SYNC WITH TOPBAR
      window.dispatchEvent(new CustomEvent("notificationRead", { detail: { id: selected.id } }));
    }
  }, [selected]);

  useEffect(() => {
    let url = "";
    if (role === "student") {
      const user_id = localStorage.getItem("student_id") || localStorage.getItem("user_id");
      url = `${localurl}notification/${school_id}/${session_id}?type=student&student_id=${user_id}`;
    } else if (role === "staff") {
      const department_id = rawUser?.department;
      url = `${localurl}notification/${school_id}/${session_id}?type=staff&department_id=${department_id}`;
    } else if (role === "admin") {
      url = `${localurl}notification/${school_id}/${session_id}?type=admin`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotifications(data.row || []);
      });
  }, []);

  return (
    <div className="min-h-[calc(100dvh-120px)] md:h-screen flex flex-col bg-gray-50">
      {/* 🔷 TOP BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#0860C4] md:bg-white text-white md:text-inherit border-b border-white/10 md:border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-white/10 md:bg-blue-50 flex items-center justify-center border border-white/20 md:border-blue-100 overflow-hidden shrink-0">
            <img
              src={schoolLogo?.startsWith("data:") ? schoolLogo : (schoolLogo ? `${import.meta.env.VITE_SERVER_URL}/${schoolLogo}` : fallbackLogo)}
              alt="logo"
              className="h-full w-full object-contain p-1"
              onError={(e) => (e.target.src = fallbackLogo)}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm md:text-lg font-bold truncate leading-tight uppercase tracking-tight">
              {schoolName || "Notification Center"}
            </h2>
            <p className="text-[9px] text-blue-100 md:text-slate-400 font-bold uppercase tracking-[0.2em] md:tracking-widest">
              Official Communications
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-[#0860C4]">
          <FaBell className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold">{notifications.length} Total Notices</span>
        </div>
      </div>

      {/* 🔷 MAIN CONTENT */}
      <div className="relative flex flex-1 overflow-hidden md:p-6 gap-6">
        {/* 🔹 LEFT LIST */}
        <div className="w-full md:w-[360px] bg-white md:rounded-xl md:border md:border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 bg-[#0860C4] rounded-full"></span>
              Recent Updates
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 md:h-full p-8 text-center opacity-40">
                <FaInbox size={48} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">No Notifications</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold">Everything is up to date</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className={`relative p-4 md:p-4 cursor-pointer transition-all duration-200 border-b border-slate-50
                    ${selected?.id === n.id ? "bg-blue-50/80 md:bg-blue-50/80" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Circular Avatar Style Icon */}
                    <div className={`h-11 w-11 md:h-10 md:w-10 shrink-0 rounded-full flex items-center justify-center transition-all
                      ${selected?.id === n.id ? "bg-[#0860C4] text-white shadow-md scale-105" : "bg-blue-50 text-[#0860C4]"}`}>
                      <FaBullhorn size={selected?.id === n.id ? 18 : 16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={`text-[13px] md:text-sm font-bold truncate 
                          ${selected?.id === n.id ? "text-slate-900" : "text-slate-700"}`}>
                          {n.title}
                        </h4>
                        <span className={`text-[9px] md:text-[10px] font-bold shrink-0 ml-2
                          ${n.read_status !== "read" ? "text-[#0860C4]" : "text-slate-400"}`}>
                          {new Date(n.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-[11px] md:text-[11px] line-clamp-1 flex-1 font-medium
                          ${n.read_status !== "read" ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                          {n.messages}
                        </p>
                        {n.read_status !== "read" && (
                          <div className="h-2 w-2 bg-[#0860C4] rounded-full shrink-0 animate-pulse shadow-[0_0_8px_rgba(8,96,196,0.5)]"></div>
                        )}
                        <FaChevronRight size={8} className="text-slate-300 md:hidden" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🔹 RIGHT VIEW / MOBILE READER */}
        <div className={`flex-1 bg-white md:rounded-xl md:border md:border-slate-200 shadow-sm overflow-hidden flex-col
          ${selected ? 'flex' : 'hidden md:flex'} 
          absolute md:relative inset-0 md:inset-auto z-40 md:z-auto`}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-30">
              <FaEnvelopeOpen size={64} className="text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Notification Reader</h3>
              <p className="text-slate-500 max-w-xs text-sm">Select a notice from the left panel to read the full content.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
                  <button onClick={() => setSelected(null)} className="md:hidden h-9 w-9 bg-slate-100 rounded-full flex shrink-0 items-center justify-center text-slate-600">
                    <FaChevronRight className="rotate-180" size={14} />
                  </button>
                  <div className="h-9 w-9 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-[#0860C4] flex items-center justify-center text-white shadow-md shrink-0">
                    <FaEnvelopeOpen size={16} className="md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] md:text-lg font-bold text-slate-900 leading-snug line-clamp-2 md:truncate">{selected.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[9px] md:text-[11px] font-bold text-[#0860C4] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {new Date(selected.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Circular</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-3 pb-24 md:p-8 overflow-y-auto bg-slate-50/70 custom-scrollbar">
                <div className="max-w-3xl mx-auto bg-white p-4 md:p-12 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 md:min-h-full flex flex-col">
                  {/* Notice Content */}
                  <div className="flex-1">
                    <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4 md:mb-8 leading-tight border-b border-slate-50 pb-4">
                      {selected.title}
                    </h2>
                    <div className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-line bg-slate-50 p-4 md:p-8 rounded-xl border border-slate-200 font-medium md:font-normal">
                      {selected.messages}
                    </div>
                  </div>

                  {/* Authorization Footer */}
                  <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-slate-100 flex flex-col items-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 md:mb-6">Authorized By</p>
                    <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-2.5 md:py-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-[#0860C4] flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm">
                        <FaUserShield size={14} className="md:w-4.5 md:h-4.5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs md:text-sm font-bold text-slate-800">{schoolName || "Administration"}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Management</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-300 mt-6 md:mt-10 font-medium">
                      Notice ID: #{selected.id.toString().padStart(6, '0')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default NotificationPage;
