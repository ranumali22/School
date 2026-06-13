import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { User, Printer, BookOpen, Clock } from "lucide-react";

const StaffTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const staff_id = authData?.id;

  useEffect(() => {
    if (school_id && session_id) {
      init();
    }
  }, [school_id, session_id]);

  const init = async () => {
    setLoading(true);
    try {
      await Promise.all([getMasters(), fetchSchool(), fetchAllAllotments()]);
    } catch (error) {
      console.error("Init Error:", error);
    }
    setLoading(false);
  };

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

  const getMasters = async () => {
    try {
      const [periodRes, subRes, classRes] = await Promise.all([
        fetch(localurl + "period/" + school_id),
        fetch(localurl + "subject/" + school_id),
        fetch(localurl + "class_section/" + school_id)
      ]);

      const periodData = await periodRes.json();
      const subData = await subRes.json();
      const classData = await classRes.json();

      if (periodData.row) {
        setPeriods(periodData.row.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      }
      setSubjects(subData.rows || subData.row || []);
      setClasses(classData.row || []);
    } catch (error) {
      console.error("Master Data Error:", error);
    }
  };

  const fetchAllAllotments = async () => {
    try {
      const res = await fetch(localurl + `staff_period_allot/${school_id}/${session_id}`);
      const data = await res.json();
      if (data.success) {
        setTimetable(data.row || []);
      }
    } catch (err) {
      console.error("Timetable Fetch Error:", err);
    }
  };

  const getSubjectName = (id) => subjects.find(s => s.id == id)?.subject_name || "-";

  const handlePrint = () => {
    window.print();
  };

  const getSubjectColor = (id) => {
    const colors = [
      "bg-[#FCE7F3] text-rose-700 border-rose-200",
      "bg-[#E0F2FE] text-blue-700 border-blue-200",
      "bg-[#F3E8FF] text-purple-700 border-purple-200",
      "bg-[#FEF3C7] text-amber-700 border-amber-200",
      "bg-[#DCFCE7] text-emerald-700 border-emerald-200",
      "bg-[#FFEDD5] text-orange-700 border-orange-200",
    ];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0860C4]"></div>
      </div>
    );
  }

  // Filter only classes where this staff member has periods
  const myClasses = classes.filter(cls =>
    timetable.some(t => (t.staff_id == staff_id || t.teacher_id == staff_id) && t.class_id == cls.id)
  );

  const myTimetable = timetable.filter(t => (t.staff_id == staff_id || t.teacher_id == staff_id));

  return (
    <div className="min-h-screen  md:px-6  md:py-8 md:bg-gray-50">
      <div className="mb-4 md:mb-6">
        <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          My Teaching Schedule
        </h4>
      </div>

      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print-area">

        {/* MOBILE VIEW - Card Layout */}
        <div className="md:hidden ">
          {myClasses.length > 0 ? (
            myClasses.map(cls => (
              <div key={cls.id} className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                {/* Class Header */}
                <div className="flex items-center gap-3 bg-[#0860C4] text-white px-4 py-3">
                  <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{cls.class_name}</p>
                    <p className="text-[11px] opacity-90">{cls.section || "Section A"}</p>
                  </div>
                </div>

                {/* Schedule Grid */}
                <div className="p-4 space-y-3">
                  {periods.map(p => {
                    const allot = myTimetable.find(t => t.period_id == p.id && t.class_id == cls.id);
                    return (
                      <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-blue-100 last:border-b-0">
                        {/* Period Time */}
                        <div className="flex-shrink-0 min-w-[70px]">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Period</p>
                          <p className="font-bold text-[13px] text-[#0860C4] mt-1">{p.period}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{p.start_time} - {p.end_time}</p>
                        </div>

                        {/* Subject Info */}
                        <div className="flex-1">
                          {allot ? (
                            <div className={`${getSubjectColor(allot.subject_id)} p-3 rounded-lg border-2`}>
                              <p className="text-[12px] font-bold uppercase leading-tight mb-2">
                                {getSubjectName(allot.subject_id)}
                              </p>
                              <div className="bg-white/50 rounded px-2 py-1">
                                <p className="text-[10px] font-bold text-gray-700">
                                  Room: {allot.room_no || "N/A"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                              <p className="text-[11px] text-gray-400 font-medium">No class scheduled</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold text-lg text-gray-700">No periods allotted to you yet.</p>
              <p className="text-sm text-gray-500 mt-1">Please contact the administrator for your schedule.</p>
            </div>
          )}
        </div>

        {/* DESKTOP VIEW - Table Layout */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="p-0 border-r border-gray-200 bg-white sticky left-0 z-20 lg:w-[150px] md:w-[120px] overflow-hidden">
                  <div className="relative h-[72px] w-full bg-white">
                    {/* Diagonal Line using SVG for precision */}
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e2e8f0" strokeWidth="1.5" />
                    </svg>
                    {/* Labels positioned in the free corners */}
                    <div className="absolute top-3 right-3 text-[10px] font-black text-[#0860C4] uppercase tracking-widest text-right">
                      Period
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                      Classes
                    </div>
                  </div>
                </th>
                {periods.map((p) => (
                  <th key={p.id} className="p-3 lg:p-4 text-center border-r border-gray-200 bg-slate-50/30 lg:min-w-[180px] md:min-w-[140px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[#0860C4] font-bold lg:text-sm md:text-xs">
                        {p.period}
                      </span>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-gray-100 shadow-sm">
                        <Clock size={10} className="text-gray-400" />
                        <span className="lg:text-[11px] md:text-[9px] font-bold text-gray-600">
                          {p.start_time} - {p.end_time}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myClasses.length > 0 ? (
                myClasses.map(cls => (
                  <tr key={cls.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="p-3 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-blue-50/20 z-10 transition-colors lg:p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-[#0860C4] flex-shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <div className="font-bold text-gray-900 lg:text-[14px] md:text-[12px] whitespace-nowrap truncate">{cls.class_name}</div>
                          <div className="font-bold text-gray-900 lg:text-[14px] md:text-[12px] whitespace-nowrap flex-shrink-0">{cls.section || "A"}</div>
                        </div>
                      </div>
                    </td>
                    {periods.map(p => {
                      const allot = myTimetable.find(t => t.period_id == p.id && t.class_id == cls.id);
                      const cellStyles = allot ? getSubjectColor(allot.subject_id) : "";

                      return (
                        <td key={p.id} className="p-1 border-r border-gray-100 last:border-r-0 lg:h-24 md:h-20 lg:min-w-[180px] md:min-w-[140px] lg:p-1.5">
                          {allot ? (
                            <div className={`h-full flex flex-col items-center justify-center p-1 rounded-lg border-2 shadow-sm transition-all hover:scale-[1.02] ${cellStyles}`}>
                              <span className="lg:text-[11px] md:text-[9px] font-bold uppercase leading-tight mb-0.5 text-center line-clamp-2">
                                {getSubjectName(allot.subject_id)}
                              </span>
                              <div className="flex items-center gap-1.5 py-0.5 px-1.5 bg-white/40 rounded-md backdrop-blur-sm border border-white/50 shadow-inner">
                                <div className="lg:text-[9px] md:text-[8px] font-bold uppercase tracking-tight">
                                  Room: {allot.room_no || "N/A"}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-10">
                              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={periods.length + 1} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <BookOpen size={48} className="mb-2" />
                      <p className="font-bold text-lg">No periods allotted to you yet.</p>
                      <p className="text-sm">Please contact the administrator for your schedule.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        
      </div>
    </div>
  );
};

export default StaffTimetable;
