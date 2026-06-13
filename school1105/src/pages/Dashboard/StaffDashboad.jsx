import {
  Users,
  ClipboardList,
  CheckSquare,
  Clock,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  ArrowRight,
  ChevronRight
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
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl h-60 md:h-72 bg-gray-100 border border-gray-200 shadow-sm group">
      {banners.map((banner, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
          <img 
            src={`${localurl.replace("/api/", "")}/uploads/banners/${banner.banner_image}`} 
            className="absolute inset-0 w-full h-full object-cover" 
            alt={banner.title} 
          />
          <div className="relative z-20 p-8 md:p-12 h-full flex flex-col justify-center">
            <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1 rounded-md w-fit uppercase tracking-wider mb-4 shadow-sm">
              {banner.title.split(' ')[0] || "Update"}
            </span>
            <h3 className="text-2xl md:text-4xl font-black text-white max-w-lg leading-tight uppercase tracking-tighter">
              {banner.title}
            </h3>
          </div>
        </div>
      ))}
      <div className="absolute bottom-6 left-12 z-30 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

const StaffDashboad = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const staff_id = authData?.id;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (school_id && session_id && staff_id) {
      init();
    }
  }, [school_id, session_id, staff_id]);

  const init = async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch(`${localurl}staff_dashboard_summary/${school_id}/${session_id}/${staff_id}`);
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }
      await Promise.all([getMasters(), fetchTimetable()]);
    } catch (error) { } finally { setLoading(false); }
  };

  const getMasters = async () => {
    try {
      const [periodRes, subRes] = await Promise.all([
        fetch(localurl + "period/" + school_id),
        fetch(localurl + "subject/" + school_id)
      ]);
      const pData = await periodRes.json();
      const sData = await subRes.json();
      if (pData.row) setPeriods(pData.row.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setSubjects(sData.rows || sData.row || []);
    } catch (err) { }
  };

  const fetchTimetable = async () => {
    try {
      const res = await fetch(localurl + `staff_period_allot/${school_id}/${session_id}`);
      const data = await res.json();
      if (data.success) {
        setTimetable(data.row || []);
      }
    } catch (err) { }
  };

  const getSubjectName = (id) => subjects.find(s => s.id == id)?.subject_name || "Subject";

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const is12h = timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm');
    let [time, modifier] = timeStr.split(' ');
    if (is12h && !modifier) {
      modifier = timeStr.slice(-2);
      time = timeStr.slice(0, -2);
    }
    let [hours, minutes] = time.split(':').map(Number);
    if (is12h) {
      if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    }
    return hours * 60 + (minutes || 0);
  };

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const mySchedule = periods.map(p => {
    const start = timeToMinutes(p.start_time);
    const end = timeToMinutes(p.end_time) || (start + 45);
    const allotment = timetable.find(t => t.period_id == p.id && (t.staff_id == staff_id || t.teacher_id == staff_id));
    let status = "upcoming";
    if (nowMinutes >= start && nowMinutes < end) status = "ongoing";
    else if (nowMinutes >= end) status = "completed";
    return { period: p, allotment, status, startTimeMinutes: start };
  }).filter(item => item.allotment).sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);

  const ongoingClass = mySchedule.find(s => s.status === "ongoing");
  const nextUpcoming = mySchedule.find(s => s.status === "upcoming");

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[#0860C4] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const profile = summary?.profile || {};
  const stats = summary?.stats || {};

  return (
    <div className="min-h-screen   overflow-x-hidden">
      <div className="max-w-7xl mx-auto  animate-in fade-in duration-500">

        {/* SIMPLE SOLID HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 mb-4 ">
          <div>
            <h1 className="text-xl md:text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-x-3">
              {getGreeting()},
              <span className="text-[#0860C4] capitalize">{profile.employeeFullName?.toLowerCase() || authData.employeeFullName?.toLowerCase() || "Faculty"}</span>
              <span className="inline-block animate-bounce origin-bottom">👋</span>
            </h1>
            <div className="flex items-center gap-2 mt-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-100 text-[#0860C4] text-[10px] font-bold rounded tracking-wide">
                {profile.designation || "Staff Member"}
              </span>
              <span className="text-gray-400 font-bold text-xs">•</span>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                {profile.department_name || authData.department_name || "Academic Section"}
              </span>
            </div>
          </div>
        </div>

        {/* CLEAN BANNER */}
        <BannerCarousel />

        {/* SOLID STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { title: "Classes Today", val: mySchedule.length, icon: <Calendar size={22} />, color: "blue" },
            { title: "Notices", val: stats.notifications?.length || 0, icon: <Bell size={22} />, color: "rose" },
            { title: "Total Classes", val: stats.totalClasses || 0, icon: <Users size={22} />, color: "emerald" },
            { title: "Total Periods", val: stats.totalPeriods || 0, icon: <Clock size={22} />, color: "indigo" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-5 md:p-6 mb-4 border border-gray-200 shadow-sm hover:border-blue-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center border-2 
                  ${item.color === 'blue' ? 'border-blue-50 bg-blue-50 text-blue-600' :
                    item.color === 'rose' ? 'border-rose-50 bg-rose-50 text-rose-600' :
                      item.color === 'emerald' ? 'border-emerald-50 bg-emerald-50 text-emerald-600' :
                        'border-indigo-50 bg-indigo-50 text-indigo-600'}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.title}</p>
                  <h3 className="text-2xl font-black text-gray-900 leading-none">{item.val}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN SCHEDULE (LEFT) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-4 md:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                 
                  <div>
                    <h4 className="font-black text-gray-900 uppercase tracking-tight">Today's Schedule</h4>
                  </div>
                </div>
                <button onClick={() => navigate("/timetable")} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-lg border border-gray-200 transition-all flex items-center gap-2">
                  View Timetable <ChevronRight size={14} />
                </button>
              </div>

              {ongoingClass ? (
                <div className="mb-8 p-6 bg-[#0860C4] rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-6 border-4 border-blue-400/20">
                  <div className="space-y-1 text-center md:text-left">
                    <div className="inline-block px-2 py-0.5 bg-blue-400/30 rounded text-[10px] font-bold tracking-wide mb-2">Ongoing Class</div>
                    <h4 className="text-4xl font-bold tracking-tight">{getSubjectName(ongoingClass.allotment.subject_id)}</h4>
                    <p className="text-blue-100 text-sm font-bold flex items-center justify-center md:justify-start gap-2">
                      <Clock size={16} /> {ongoingClass.period.period} • {ongoingClass.period.start_time} - {ongoingClass.period.end_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-inner min-w-[180px]">
                    <div className="h-12 w-12 bg-blue-50 text-[#0860C4] rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 tracking-wide mb-1">Assigned Room</p>
                      <p className="text-xl font-bold text-gray-900">Room {ongoingClass.allotment.room_no || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-center">
                  <div>
                    <h4 className="text-xl font-bold text-gray-400 tracking-tight mb-1">
                      {nextUpcoming ? `Next Up: ${getSubjectName(nextUpcoming.allotment.subject_id)}` : 'No Classes Scheduled'}
                    </h4>
                    <p className="text-gray-400 text-[10px] font-bold tracking-widest">
                      {nextUpcoming ? `Starts at ${nextUpcoming.period.start_time}` : 'Enjoy your break'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySchedule.map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-lg border transition-all ${item.status === 'ongoing' ? 'bg-blue-50 border-blue-300' :
                    item.status === 'completed' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-black text-sm border ${item.status === 'ongoing' ? 'bg-[#0860C4] text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}>
                          {item.period.period.match(/\d+/)?.[0] || 'P'}
                        </div>
                        <div>
                          <h5 className={`font-black uppercase tracking-tight ${item.status === 'ongoing' ? 'text-[#0860C4]' : 'text-gray-900'}`}>{getSubjectName(item.allotment.subject_id)}</h5>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.period.start_time} - {item.period.end_time}</p>
                        </div>
                      </div>
                      {item.status === 'ongoing' && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR (RIGHT) */}
          <div className="">
            {/* SOLID NOTICE BOARD */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-2 border-b border-gray-50 pb-4">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                  <Bell size={18} className="text-[#0860C4]" />
                  Latest Notices
                </h3>
                <button onClick={() => navigate("/staff/notification-pannel")} className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                  ALL
                </button>
              </div>

              <div className="space-y-3">
                {stats.notifications?.length > 0 ? stats.notifications.slice(0, 3).map((n, i) => (
                  <div key={i} className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => navigate("/notice")}>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {new Date(n.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#0860C4]">{n.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-medium leading-normal">{n.messages}</p>
                  </div>
                )) : (
                  <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <MessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Active Notices</p>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: "Daily Attendance", icon: <CheckSquare size={18} />, path: "/student-attendance", color: "blue" },
                { name: "Manage Students", icon: <Users size={18} />, path: "/students", color: "gray" }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:border-[#0860C4] hover:shadow-md transition-all group"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${action.color === 'blue' ? 'bg-blue-50 text-[#0860C4]' : 'bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-[#0860C4]'}`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{action.name}</span>
                  <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all text-[#0860C4]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default StaffDashboad;