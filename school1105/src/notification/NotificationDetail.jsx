import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { localurl } from "../api/api";

const NotificationDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const n = state;

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");

  // 🔥 MARK AS READ
  useEffect(() => {
    if (n?.read_status !== "read") {
      fetch(`${localurl}read_notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: n.id,
          type: "single",
          school_id,
          session_id,
        }),
      });
    }
  }, []);

  if (!n)
    return (
      <div className="p-10 text-center text-gray-400">
        No notification data
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">

      {/* 🔙 HEADER BAR */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <span className="text-xs text-gray-400">
          Notification Detail
        </span>
      </div>

      {/* 📩 MAIN CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border overflow-hidden">

        {/* TOP HEADER */}
        <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">

          {/* ICON */}
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white shadow text-blue-600">
            <Bell size={20} />
          </div>

          {/* TITLE + DATE */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {n.title}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(n.date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* STATUS */}
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium
            ${
              n.read_status !== "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {n.read_status !== "read" ? "New" : "Read"}
          </span>
        </div>

        {/* BODY */}
        <div className="px-6 py-6">

          {/* MESSAGE BOX */}
          <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {n.messages}
          </div>

        </div>

      </div>

    </div>
  );
};

export default NotificationDetail;