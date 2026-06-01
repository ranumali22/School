import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { User, Printer, Clock, BookOpen } from "lucide-react";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);

  const authRole = (localStorage.getItem("authRole") || "").toLowerCase();
  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const student_id = localStorage.getItem("student_id");
  const student_class_id = localStorage.getItem("student_class_id");
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const sessionData = JSON.parse(localStorage.getItem("session_data") || "{}");

  useEffect(() => {
    if (school_id && session_id) {
      init();
    }
  }, [school_id, session_id, student_id]);

  const init = async () => {
    setLoading(true);
    await getMasters();

    if (authRole === "student" && student_id) {
      let classToFetch = student_class_id;
      if (!classToFetch || classToFetch === "undefined" || classToFetch === "null") {
        try {
          const response = await fetch(`${localurl}student/${student_id}`);
          const data = await response.json();
          if (data.success && data.data.registerClass) {
            classToFetch = data.data.registerClass;
            setStudentInfo(data.data);
          }
        } catch (error) { }
      } else {
        try {
          const response = await fetch(`${localurl}student/${student_id}`);
          const data = await response.json();
          if (data.success) {
            setStudentInfo(data.data);
          }
        } catch (error) { }
      }
      if (classToFetch) await fetchTimetable(classToFetch);
    } else {
      await fetchAllAllotments();
    }
    setLoading(false);
  };

  const getMasters = async () => {
    try {
      const [empRes, periodRes, subRes, classRes] = await Promise.all([
        fetch(localurl + "employee/" + school_id + "/" + session_id),
        fetch(localurl + "period/" + school_id),
        fetch(localurl + "subject/" + school_id),
        fetch(localurl + "class_section/" + school_id)
      ]);

      const empData = await empRes.json();
      const periodData = await periodRes.json();
      const subData = await subRes.json();
      const classData = await classRes.json();

      setEmployees(empData.row || []);
      if (periodData.row) {
        setPeriods(periodData.row.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      }
      setSubjects(subData.rows || subData.row || []);
      setClasses(classData.row || []);
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

  const fetchAllAllotments = async () => {
    try {
      const res = await fetch(localurl + `staff_period_allot/${school_id}/${session_id}`);
      const data = await res.json();
      if (data.success) {
        setTimetable(data.row || []);
      }
    } catch (err) { }
  };

  const getStaffName = (id) => employees.find(e => e.id == id)?.employeeFullName || "-";
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

  const classesToShow = authRole === "student"
    ? (studentInfo ? [{ id: studentInfo.registerClass, class_name: studentInfo.section_class, section: studentInfo.section || "" }] : [])
    : classes;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print-area { border: none !important; box-shadow: none !important; width: 100% !important; margin: 0 !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}</style>

      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold ">Class Time-table</h2>
          <p className="text-gray-500 font-medium mt-1">Detailed period distribution for your academic session.</p>
        </div>
        <button
          onClick={handlePrint}
          className="hidden md:flex w-auto bg-[#0860C4] text-white px-6 py-3 rounded-xl font-bold items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-md active:scale-95 text-xs no-print"
        >
          <Printer size={14} className="md:w-4 md:h-4" />
          <span>Print Schedule</span>
        </button>
      </div>


      <div className="hidden md:block max-w-[1400px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print-area">

        {/* School Branding Header */}
        {/* <div className="relative  border-b border-gray-100 text-center bg-slate-50/50">
          {authData.upload_logo && (
            <img
              src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${import.meta.env.VITE_SERVER_URL}/uploads/${authData.upload_logo}`}
              className="w-20 h-20 object-contain mx-auto mb-4"
              alt="Logo"
            />
          )}
          <h1 className="!text-[26px] !font-bold text-gray-900 uppercase !tracking-tighter mb-1 leading-none">
            {authData.school_name}
          </h1>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[2px]">
            {authData.address || authData.school_address}
          </p>
        </div> */}

        {/* Timetable Grid */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="p-0 border-r border-gray-200 bg-white sticky left-0 z-20 w-[80px] overflow-hidden">
                  <div className="relative h-[60px] w-full bg-white">
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e2e8f0" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute top-3 right-3 text-[10px] font-bold text-[#0860C4] uppercase tracking-widest text-right">
                      Period
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] font-bold text-[#0860C4] uppercase tracking-widest text-left">
                      Classes
                    </div>
                  </div>
                </th>
                {periods.map((p) => (
                  <th key={p.id} className=" text-center border-r border-gray-200 bg-slate-50/30 w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[#0860C4] font-bold text-sm">
                        {p.period}
                      </span>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-gray-100 shadow-sm">
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-600">
                          {p.start_time} - {p.end_time}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classesToShow.length > 0 ? (
                classesToShow.map(cls => (
                  <tr key={cls.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="p-2 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-blue-50/20 z-10 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-[#0860C4]">
                          <BookOpen size={16} />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="font-bold text-gray-900 text-[14px] whitespace-nowrap">{cls.class_name}</div>
                          <div className="font-bold text-gray-900 text-[14px] whitespace-nowrap">{cls.section || ""}</div>
                        </div>
                      </div>
                    </td>
                    {periods.map(p => {
                      const allot = timetable.find(t =>
                        t.period_id == p.id &&
                        (authRole === "student" ? true : t.class_id == cls.id)
                      );
                      const cellStyles = allot ? getSubjectColor(allot.subject_id) : "";

                      return (
                        <td key={p.id} className="p-1 border-r border-gray-100 last:border-r-0 h-18 min-w-[100px]">
                          {allot ? (
                            <div className={`h-fit py-2.5 px-3 mx-auto w-fit min-w-[110px] flex flex-col items-center justify-center rounded-lg border shadow-sm transition-all hover:scale-[1.02] ${cellStyles}`}>
                              <span className="text-[11px] font-bold uppercase leading-tight text-center line-clamp-1">
                                {getSubjectName(allot.subject_id)}
                              </span>
                              <div className="flex items-center gap-1 py-0 px-1 bg-white/40 rounded backdrop-blur-sm border border-white/50 shadow-inner">
                                <div className="text-[9px] font-bold uppercase tracking-tight flex items-center gap-1">
                                  <User size={8} />
                                  <span className="truncate max-w-[90px]">
                                    {getStaffName(allot.staff_id || allot.teacher_id)}
                                  </span>
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
                      <p className="font-bold text-lg">No timetable data found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>

      {/* 🔷 MOBILE TIMELINE VIEW */}
      <div className="block md:hidden space-y-4 pb-20 mt-6">
        {periods.length > 0 ? (
          periods.map((p, idx) => {
            const allotment = timetable.find(t => t.period_id == p.id);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0860C4]"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.period}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100">
                    <Clock size={10} className="text-[#0860C4]" />
                    <span className="text-[10px] font-bold text-[#0860C4]">{p.start_time} - {p.end_time}</span>
                  </div>
                </div>

                {allotment ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">
                        {subjects.find(s => s.id == allotment.subject_id)?.subject_name || "Subject"}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Room: {allotment.room_no || "N/A"}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                      <div className="h-6 w-6 bg-blue-50/50 rounded-full flex items-center justify-center text-[#0860C4]">
                        <User size={12} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 truncate">
                        {employees.find(e => e.id == (allotment.staff_id || allotment.teacher_id))?.employeeFullName || "Instructor"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-1">
                    <BookOpen size={14} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic">Free Period</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Clock size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Schedule Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTimetable;
