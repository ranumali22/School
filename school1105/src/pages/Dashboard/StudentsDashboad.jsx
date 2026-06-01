import {
  BookOpen,
  CheckSquare,
  ClipboardList,
  Clock,
  IndianRupee,
  MapPin,
  Play,
  User as UserIcon,
  Bell,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { localurl } from "../../api/api";

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState([]);
  const school_id = localStorage.getItem("school_id");

  useEffect(() => {
    if (school_id) {
      fetch(`${localurl}banners/${school_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const activeBanners = (data.row || []).filter(b => b.status === "Active");
            setBanners(activeBanners);
          }
        })
        .catch(err => console.error("Error fetching banners:", err));
    }
  }, [school_id]);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrent(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] h-56 md:h-64 bg-gray-100 shadow-sm border border-gray-50 group">
      {banners.map((banner, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${i % 3 === 0 ? 'from-blue-900/60' : i % 3 === 1 ? 'from-emerald-900/60' : 'from-indigo-900/60'} to-transparent z-10`}></div>
          <img 
            src={`${localurl.replace("/api/", "")}/uploads/banners/${banner.banner_image}`} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt={banner.title} 
          />
          <div className="relative z-20 p-8 md:p-12 h-full flex flex-col justify-center">
            <span className={`bg-white/90 ${i % 3 === 0 ? 'text-blue-600' : i % 3 === 1 ? 'text-emerald-600' : 'text-indigo-600'} text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest mb-4 animate-in fade-in slide-in-from-left duration-700`}>
              {banner.title.split(' ')[0] || "Update"}
            </span>
            <h3 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg max-w-lg animate-in fade-in slide-in-from-left duration-1000">
              {banner.title}
            </h3>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};

const StudentsDashboad = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const student_id = localStorage.getItem("student_id");
  const student_class_id = localStorage.getItem("student_class_id");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (school_id && session_id && student_id) {
      init();
    }
  }, [school_id, session_id, student_id]);

  const init = async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch(`${localurl}student_dashboard_summary/${school_id}/${session_id}/${student_id}`);
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      await getMasters();

      let classToFetch = student_class_id;
      if (!classToFetch || classToFetch === "undefined" || classToFetch === "null") {
        if (summaryData.success && summaryData.data.profile.registerClass) {
          classToFetch = summaryData.data.profile.registerClass;
        }
      }

      if (classToFetch && classToFetch !== "undefined" && classToFetch !== "null") {
        await fetchTimetable(classToFetch);
      }
    } catch (error) {
      console.error("Dashboard Init Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMasters = async () => {
    try {
      const [empRes, periodRes, subRes] = await Promise.all([
        fetch(localurl + "employee/" + school_id + "/" + session_id),
        fetch(localurl + "period/" + school_id),
        fetch(localurl + "subject/" + school_id)
      ]);

      const empData = await empRes.json();
      const periodData = await periodRes.json();
      const subData = await subRes.json();

      setEmployees(empData.row || []);
      if (periodData.row) {
        setPeriods(periodData.row.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      }
      setSubjects(subData.rows || subData.row || []);
    } catch (error) { }
  };

  const fetchTimetable = async (class_id) => {
    try {
      const res = await fetch(localurl + `student_timetable/${school_id}/${session_id}/${class_id}`);
      const data = await res.json();
      if (data.success) {
        setTimetable(data.data || []);
      }
    } catch (err) { }
  };

  const getStaffName = (id) => employees.find(e => e.id == id)?.employeeFullName || "Staff";
  const getSubjectName = (id) => subjects.find(s => s.id == id)?.subject_name || "Subject";

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const is12h = timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm');
    if (is12h) {
      let [time, modifier] = timeStr.split(' ');
      if (!modifier) {
        modifier = timeStr.slice(-2);
        time = timeStr.slice(0, -2);
      }
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    }
    const parts = timeStr.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  };

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const ongoingPeriod = periods.find(p => {
    const start = timeToMinutes(p.start_time);
    const end = timeToMinutes(p.end_time) || (start + 45);
    return nowMinutes >= start && nowMinutes < end;
  });

  const ongoingClass = ongoingPeriod ? timetable.find(t => t.period_id == ongoingPeriod.id) : null;

  const dailyTimeline = periods
    .map(p => {
      const start = timeToMinutes(p.start_time);
      const end = timeToMinutes(p.end_time) || (start + 45);
      const allotment = timetable.find(t => t.period_id == p.id);
      let status = "upcoming";
      if (nowMinutes >= start && nowMinutes < end) status = "ongoing";
      else if (nowMinutes >= end) status = "completed";
      return { period: p, allotment, status, startTimeMinutes: start };
    })
    .filter(item => item.allotment)
    .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);

  const nextUpcoming = dailyTimeline.find(item => item.status === "upcoming");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium text-sm">Setting up your day...</p>
        </div>
      </div>
    );
  }

  const profile = summary?.profile || {};
  const stats = summary?.stats || {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] p-4 md:p-8 pb-32 md:pb-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* 🔷 HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight flex items-center flex-wrap gap-x-2">
              {getGreeting()},
              <span className="text-[#0860C4] capitalize">{profile.studentName?.toLowerCase() || "Student"}</span>
              <span className="inline-block animate-bounce origin-bottom">👋</span>
            </h1>
            <p className="text-gray-500 mt-1 font-bold text-sm">
              Class {profile.class_name || "N/A"} • Roll No: {profile.roll_no || "N/A"}
            </p>
          </div>
        </div>

        {/* 🔷 SCHOOL BANNER CAROUSEL */}
        <BannerCarousel />

        {/* 🔷 BEAUTIFUL STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: "Attendance", val: `${stats.attendance?.percentage || 0}%`, sub: `${stats.attendance?.present} Days`, icon: <CheckSquare size={20} />, color: "blue" },
            { title: "Fee Balance", val: `₹${stats.fees?.balance?.toLocaleString()}`, sub: stats.fees?.balance > 0 ? "Pending" : "Cleared", icon: <IndianRupee size={20} />, color: "emerald" },
            { title: "Academics", val: stats.tests?.total || 0, sub: "Tests Completed", icon: <GraduationCap size={20} />, color: "indigo" },
            { title: "Notices", val: stats.notifications?.length || 0, sub: "Latest Updates", icon: <Bell size={20} />, color: "rose" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 text-center md:text-left">
                <div className={`h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center 
                  ${item.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                    item.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                      item.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' :
                        'bg-rose-50 text-rose-500'}`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{item.title}</p>
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mt-0.5">{item.val}</h3>
                  <p className={`text-[9px] md:text-[10px] font-bold mt-1 ${item.color === 'emerald' && stats.fees?.balance > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {item.sub}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 🔷 TODAY'S HIGHLIGHTS (LEFT) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Calendar size={18} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Today's Schedule</h2>
                </div>
                <div className="text-[10px] md:text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full shrink-0">
                  {currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
              </div>

              {ongoingPeriod ? (
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl text-white shadow-lg shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Ongoing Now</p>
                    <h4 className="text-3xl font-bold">{ongoingClass ? getSubjectName(ongoingClass.subject_id) : 'Free Period'}</h4>
                    <p className="text-blue-100 text-sm flex items-center justify-center md:justify-start gap-2">
                      <Clock size={14} /> {ongoingPeriod.period} • {ongoingPeriod.start_time} - {ongoingPeriod.end_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <UserIcon size={20} />
                    </div>
                    <div className="pr-2">
                      <p className="text-[10px] font-bold text-blue-100 uppercase">Instructor</p>
                      <p className="text-sm font-bold">{ongoingClass ? getStaffName(ongoingClass.staff_id) : 'Self Study'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {nextUpcoming ? `Next: ${getSubjectName(nextUpcoming.allotment.subject_id)}` : 'No more classes today'}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {nextUpcoming ? `Starts at ${nextUpcoming.period.start_time}` : 'See you tomorrow!'}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm">
                    <Clock size={24} />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Timeline</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyTimeline.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border transition-all ${item.status === 'ongoing' ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50' :
                      item.status === 'completed' ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 hover:border-blue-100'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${item.status === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {item.period.period.match(/\d+/)?.[0] || 'P'}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-gray-800">{getSubjectName(item.allotment.subject_id)}</h5>
                            <p className="text-[10px] text-gray-500 font-medium">{item.period.start_time} - {item.period.end_time}</p>
                          </div>
                        </div>
                        {item.status === 'ongoing' && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 🔷 RIGHT COLUMN: NOTICES & TOOLS */}
          <div className="space-y-6 md:space-y-8">
            {/* Notices Card */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#0860C4]" />
                  Announcements
                </h3>
                <button
                  onClick={() => navigate("/notification-pannel")}
                  className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-wider hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {stats.notifications?.length > 0 ? stats.notifications.map((n, i) => (
                  <div key={i} className="group p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer" onClick={() => navigate("/notification-pannel")}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                        {new Date(n.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{n.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-medium">{n.messages}</p>
                  </div>
                )) : (
                  <div className="py-8 text-center opacity-40">
                    <ClipboardList size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No new updates</p>
                  </div>
                )}
              </div>
            </div>


          </div>

        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        @media (max-width: 768px) {
          .main-content, .page-content {
            overflow: visible !important;
          }
          body {
            overflow-y: auto !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentsDashboad;