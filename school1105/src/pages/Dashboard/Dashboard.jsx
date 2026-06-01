import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Download,
  Users,
  UserCheck,
  IndianRupee,
  MessageSquare,
  ClipboardList,
  CreditCard,
  QrCode,
  Clock,
  BookOpen,
  GraduationCap,
  CheckSquare
} from "lucide-react";
import { localurl } from "../../api/api";

const DashboardGrid = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    students: 0,
    staff: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const schoolData = JSON.parse(localStorage.getItem("school_data"));
        const sessionData = JSON.parse(localStorage.getItem("session_data"));

        if (schoolData && sessionData) {
          const schoolId = schoolData.id;
          const sessionId = sessionData.id;

          // Fetch Students Count
          const studentRes = await axios.get(`${localurl}students/${schoolId}/${sessionId}`);
          // Fetch Staff Count
          const staffRes = await axios.get(`${localurl}employee/${schoolId}/${sessionId}`);

          setCounts({
            students: studentRes.data?.length || 0,
            staff: staffRes.data?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const menu = [
    { name: "Download App", icon: <Download size={35} />, path: "/download-app" },
    { name: "SMS Balance", icon: <MessageSquare size={35} />, path: "/sms-balance" },
    { name: ` Students`, icon: <Users size={35} />, path: "/student-list" },
    { name: ` Staff`, icon: <UserCheck size={35} />, path: "/staff-list" },
    { name: "Active User", icon: <Users size={35} />, path: "/users" },
    { name: "Fees Today", icon: <IndianRupee size={35} />, path: "/fees-today" },

    { name: "Help Videos", icon: <BookOpen size={35} />, path: "/help-videos" },
    { name: "Enquiry", icon: <ClipboardList size={35} />, path: "/enquiry" },
    { name: "Attendance Report", icon: <CheckSquare size={35} />, path: "/student-attendance-table" },
    { name: "ID Cards", icon: <CreditCard size={35} />, path: "/id-cards" },
    { name: "Admit Cards", icon: <CreditCard size={35} />, path: "/admit-cards" },
    { name: "Transfer Certificate", icon: <GraduationCap size={35} />, path: "/transfer-certificate" },

    { name: "QR Attendance", icon: <QrCode size={35} />, path: "/qr-attendance" },
    { name: "Student Attendance", icon: <CheckSquare size={35} />, path: "/student-attendance" },
    { name: "Notice", icon: <ClipboardList size={35} />, path: "/notice" },
    { name: "Time Table", icon: <Clock size={35} />, path: "/student-timetable" },
    { name: "Home Work", icon: <BookOpen size={35} />, path: "/homework" },
    // { name: "Staff", icon: <Users size={35}/>, path: "/staff-list" },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {menu.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-white border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:shadow-md group"
          >
            <div className="text-[#0860C4] mb-3 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>

            <p className="text-gray-700 text-[13px] font-medium text-center">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;
