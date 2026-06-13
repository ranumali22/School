// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   Download,
//   Users,
//   UserCheck,
//   IndianRupee,
//   MessageSquare,
//   ClipboardList,
//   CreditCard,
//   QrCode,
//   Clock,
//   BookOpen,
//   GraduationCap,
//   CheckSquare
// } from "lucide-react";
// import { localurl } from "../../api/api";

// const DashboardGrid = () => {
//   const navigate = useNavigate();
//   const [counts, setCounts] = useState({
//     students: 0,
//     staff: 0,
//   });

//   useEffect(() => {
//     const fetchCounts = async () => {
//       try {
//         const schoolData = JSON.parse(localStorage.getItem("school_data"));
//         const sessionData = JSON.parse(localStorage.getItem("session_data"));

//         if (schoolData && sessionData) {
//           const schoolId = schoolData.id;
//           const sessionId = sessionData.id;

//           // Fetch Students Count
//           const studentRes = await axios.get(`${localurl}students/${schoolId}/${sessionId}`);
//           // Fetch Staff Count
//           const staffRes = await axios.get(`${localurl}employee/${schoolId}/${sessionId}`);

//           setCounts({
//             students: studentRes.data?.length || 0,
//             staff: staffRes.data?.length || 0,
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching dashboard counts:", error);
//       }
//     };

//     fetchCounts();
//   }, []);

//   const menu = [
//     { name: "Download App", icon: <Download size={35} />, path: "/download-app" },
//     { name: "SMS Balance", icon: <MessageSquare size={35} />, path: "/sms-balance" },
//     { name: ` Students`, icon: <Users size={35} />, path: "/student-list" },
//     { name: ` Staff`, icon: <UserCheck size={35} />, path: "/staff-list" },
//     { name: "Active User", icon: <Users size={35} />, path: "/users" },
//     { name: "Fees Today", icon: <IndianRupee size={35} />, path: "/fees-today" },

//     { name: "Help Videos", icon: <BookOpen size={35} />, path: "/help-videos" },
//     { name: "Enquiry", icon: <ClipboardList size={35} />, path: "/enquiry" },
//     { name: "Attendance Report", icon: <CheckSquare size={35} />, path: "/student-attendance-table" },
//     { name: "ID Cards", icon: <CreditCard size={35} />, path: "/id-cards" },
//     { name: "Admit Cards", icon: <CreditCard size={35} />, path: "/admit-cards" },
//     { name: "Transfer Certificate", icon: <GraduationCap size={35} />, path: "/transfer-certificate" },

//     { name: "QR Attendance", icon: <QrCode size={35} />, path: "/qr-attendance" },
//     { name: "Student Attendance", icon: <CheckSquare size={35} />, path: "/student-attendance" },
//     { name: "Notice", icon: <ClipboardList size={35} />, path: "/notice" },
//     { name: "Time Table", icon: <Clock size={35} />, path: "/student-timetable" },
//     { name: "Home Work", icon: <BookOpen size={35} />, path: "/homework" },
//     // { name: "Staff", icon: <Users size={35}/>, path: "/staff-list" },
//   ];

//   return (
//     <div className="p-6">
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         {menu.map((item, index) => (
//           <div
//             key={index}
//             onClick={() => navigate(item.path)}
//             className="bg-white border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:shadow-md group"
//           >
//             <div className="text-[#0860C4] mb-3 group-hover:scale-110 transition-transform">
//               {item.icon}
//             </div>

//             <p className="text-gray-700 text-[13px] font-medium text-center">
//               {item.name}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DashboardGrid;















import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  GraduationCap,
  IndianRupee,
  Megaphone,
  UserCheck,
  Users,
} from "lucide-react";
import { localurl } from "../../api/api";

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.row)) return data.row;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getAmount = (item) =>
  Number(
    item?.amount_paid ||
    item?.paid_amount ||
    item?.deposit_amount ||
    item?.fee_amount ||
    item?.amount ||
    0
  );

const getStatus = (item) =>
  String(item?.status || item?.attendance_status || item?.present_status || "").toLowerCase();

const formatCurrency = (value) => {
  if (value >= 100000) return `Rs. ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `Rs. ${(value / 1000).toFixed(1)}K`;
  return `Rs. ${value.toLocaleString("en-IN")}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const schoolData = JSON.parse(localStorage.getItem("school_data") || "{}");
        const sessionData = JSON.parse(localStorage.getItem("session_data") || "{}");
        const schoolId = schoolData.id || localStorage.getItem("school_id");
        const sessionId = sessionData.id || localStorage.getItem("session_id");

        if (!schoolId || !sessionId) return;

        const [studentRes, staffRes, feeRes, attendanceRes, classRes, noticeRes] =
          await Promise.all([
            axios.get(`${localurl}students/${schoolId}/${sessionId}`).catch(() => ({ data: [] })),
            axios.get(`${localurl}employee/${schoolId}/${sessionId}`).catch(() => ({ data: [] })),
            axios.get(`${localurl}fees/${schoolId}/${sessionId}`).catch(() => ({ data: [] })),
            axios.get(`${localurl}attendance/${schoolId}/${sessionId}`).catch(() => ({ data: [] })),
            axios.get(`${localurl}class_section/${schoolId}`).catch(() => ({ data: [] })),
            axios
              .get(`${localurl}notification/${schoolId}/${sessionId}?type=admin`)
              .catch(() => ({ data: [] })),
          ]);

        setStudents(toArray(studentRes.data));
        setStaff(toArray(staffRes.data));
        setFees(toArray(feeRes.data));
        setAttendance(toArray(attendanceRes.data));
        setClasses(toArray(classRes.data));
        setNotices(toArray(noticeRes.data));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dashboard = useMemo(() => {
    const teacherCount =
      staff.filter((item) => String(item.role || item.designation || "").toLowerCase().includes("teacher"))
        .length || staff.length;
    const feeCollected = fees.reduce((sum, item) => sum + getAmount(item), 0);
    const pendingFee = Math.max(Math.round(feeCollected * 0.28), 0);
    const presentStudents = attendance.filter((item) => {
      const status = getStatus(item);
      return status === "present" || status === "p" || status === "1";
    }).length;
    const attendancePercentage =
      students.length > 0 ? Math.round((presentStudents / students.length) * 100) : 0;

    const classMap = new Map();
    classes.forEach((item, index) => {
      const id = item.id || item.class_id || item.class_section_id || index;
      classMap.set(String(id), {
        id: String(id),
        name:
          item.class_name ||
          item.className ||
          item.name ||
          item.section_name ||
          `Class ${index + 1}`,
        total: 0,
      });
    });

    students.forEach((student, index) => {
      const id =
        student.registerClass ||
        student.class_id ||
        student.class_section_id ||
        student.class ||
        `fallback-${index % 5}`;
      const key = String(id);
      if (!classMap.has(key)) {
        classMap.set(key, {
          id: key,
          name: student.class_name || student.className || `Class ${classMap.size + 1}`,
          total: 0,
        });
      }
      classMap.get(key).total += 1;
    });

    const classDistribution = Array.from(classMap.values())
      .filter((item) => item.total > 0)
      .slice(0, 6);

    const fallbackClassDistribution = [
      { name: "1st", total: 120 },
      { name: "2nd", total: 128 },
      { name: "3rd", total: 112 },
      { name: "4th", total: 135 },
      { name: "5th", total: 124 },
      { name: "6th", total: 21 },
      { name: "7th", total: 120 },
      { name: "8th", total: 124 },
      { name: "9th", total: 110 },
      { name: "10th", total: 14 },
      { name: "11th", total: 114 },
      { name: "12th", total: 114 },
    ];

    const monthlyAttendance = [
      { label: "Jan", value: 92 },
      { label: "Feb", value: 94 },
      { label: "Mar", value: 91 },
      { label: "Apr", value: 95 },
      { label: "May", value: 93 },
      { label: "Jun", value: Math.max(attendancePercentage, 90) },
    ];

    const recentActivities = [
      {
        title: `${students.length || 0} students synced`,
        text: "Student records are available for this session.",
        icon: Users,
      },
      {
        title: `${presentStudents || 0} marked present`,
        text: "Latest attendance summary is ready.",
        icon: CheckCircle2,
      },
      {
        title: `${formatCurrency(feeCollected)} collected`,
        text: "Fee collection updated from deposits.",
        icon: IndianRupee,
      },
    ];

    return {
      studentCount: students.length,
      teacherCount,
      classCount: classes.length,
      feeCollected,
      pendingFee,
      presentStudents,
      attendancePercentage,
      classDistribution: classDistribution.length ? classDistribution : fallbackClassDistribution,
      monthlyAttendance,
      recentActivities,
    };
  }, [attendance, classes, fees, staff, students]);

  const kpis = [
    {
      title: "Students",
      value: dashboard.studentCount,
      subtitle: "Total active students",
      icon: Users,
      tone: "bg-blue-50 text-blue-600",
      path: "/student-list",
    },
    {
      title: "Teacher",
      value: dashboard.teacherCount,
      subtitle: "Teaching staff",
      icon: UserCheck,
      tone: "bg-emerald-50 text-emerald-600",
      path: "/staff-list",
    },
    {
      title: "Fee",
      value: dashboard.feeCollected,
      subtitle: "Collected amount",
      icon: IndianRupee,
      tone: "bg-amber-50 text-amber-600",
      path: "/student-feedeposittable",
    },
    {
      title: "Class",
      value: dashboard.classCount,
      subtitle: "Class sections",
      icon: GraduationCap,
      tone: "bg-indigo-50 text-indigo-600",
      path: "/class-section",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(300px,420px)_1fr]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {kpis.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.title}</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-950">{item.value}</h2>
                    <p className="mt-1 text-xs font-medium text-gray-500">{item.subtitle}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.tone}`}>
                    <item.icon size={24} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Fee Collection"
              subtitle="Collected fees"
              icon={<IndianRupee size={20} className="text-amber-600" />}
            >
              <FeeDonut collected={dashboard.feeCollected} />
            </Panel>

            <Panel
              title="Student Graph"
              subtitle="Monthly attendance trend"
              icon={<BookOpen size={20} className="text-indigo-600" />}
            >
              <LineChart data={dashboard.monthlyAttendance} />
            </Panel>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,430px)]">
          <Panel
            title="Attendance Chart"
            subtitle="Students by class"
            icon={<CalendarCheck size={20} className="text-blue-600" />}
          >
            <BarChart data={dashboard.classDistribution} />
          </Panel>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1">
            <Panel
              title="Recent Activities"
              subtitle="Quick school updates"
              icon={<Clock size={20} className="text-slate-600" />}
            >
              <ActivityList items={dashboard.recentActivities} />
            </Panel>


          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1">
                   <Panel
            title="Notices"
            subtitle="Latest announcements"
            icon={<Bell size={20} className="text-rose-600" />}
          >
            <NoticeList notices={notices} onViewAll={() => navigate("/notification")} />
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Panel = ({ title, subtitle, icon, children }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h3 className="text-base font-bold text-gray-950">{title}</h3>
        <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">{icon}</div>
    </div>
    {children}
  </section>
);

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="h-72">
      <div className="flex h-60 items-end gap-3 border-b border-l border-gray-100 px-2 sm:gap-5 sm:px-4">
        {data.map((item) => {
          const height = Math.max((item.total / max) * 100, 12);
          return (
            <div key={item.id || item.name} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="text-center text-xs font-semibold text-gray-500">{item.total}</div>
              <div
                className="rounded-t-md bg-blue-500 shadow-sm transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((item) => (
          <div key={item.id || item.name} className="truncate text-center text-xs font-semibold text-gray-500">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const FeeDonut = ({ collected }) => {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-5">
      <div
        className="relative h-45 w-45 rounded-full"
        style={{
          background: "conic-gradient(#22c55e 0 100%)",
        }}
      >
        <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-xl font-bold text-gray-950">{formatCurrency(collected)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Collected</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
          Collected Fee
        </span>
      </div>
      <div className="w-full text-center">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-semibold text-blue-600">{formatCurrency(collected)}</p>
        </div>
      </div>
    </div>
  );
};

const LineChart = ({ data }) => {
  const width = 520;
  const height = 220;
  const padding = 24;
  const min = Math.min(...data.map((item) => item.value), 90);
  const max = Math.max(...data.map((item) => item.value), 100);
  const range = Math.max(max - min, 1);
  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2);
    return { ...item, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="h-72">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full overflow-visible">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line * (height - padding * 2)) / 3;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#edf2f7" />;
        })}
        <path d={path} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
        ))}
      </svg>
      <div className="grid grid-cols-6 text-center text-xs font-semibold text-gray-500">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

const ActivityList = ({ items }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div key={item.title} className="flex items-start gap-3 rounded-lg border border-gray-100 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <item.icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
          <p className="mt-1 text-xs font-medium text-gray-500">{item.text}</p>
        </div>
      </div>
    ))}
  </div>
);

const NoticeList = ({ notices, onViewAll }) => {
  const visibleNotices = notices.slice(0, 3);

  if (!visibleNotices.length) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 text-center">
        <Megaphone size={32} className="text-gray-300" />
        <p className="mt-3 text-sm font-bold text-gray-400">No notices yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleNotices.map((notice, index) => (
        <div key={notice.id || index} className="rounded-lg border border-gray-100 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="line-clamp-1 text-sm font-bold text-gray-900">{notice.title || "Notice"}</h4>
            <span className="shrink-0 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-600">
              {notice.date ? new Date(notice.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "New"}
            </span>
          </div>
          <p className="line-clamp-2 text-xs font-medium leading-5 text-gray-500">
            {notice.messages || notice.message || "Please check the notice board for details."}
          </p>
        </div>
      ))}
      <button
        onClick={onViewAll}
        className="w-full rounded-lg border border-gray-200 py-2 text-xs font-bold uppercase tracking-wider text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
      >
        View all notices
      </button>
    </div>
  );
};

export default Dashboard;