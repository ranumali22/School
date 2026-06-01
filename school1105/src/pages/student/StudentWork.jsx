import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBookOpen,
  FaCalendarAlt,
  FaRegFilePdf,
  FaImage,
  FaEye,
  FaUserTie,
  FaGraduationCap
} from "react-icons/fa";
import { localurl } from "../../api/api";

const StudentWork = () => {
  const [workList, setWorkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentName, setStudentName] = useState("Student");

  const school_id = localStorage.getItem("school_id");
  const session_id = localStorage.getItem("session_id");
  const student_class_id = localStorage.getItem("student_class_id");
  const student_id = localStorage.getItem("student_id");

  const imageBase = localurl.replace("/api/", "/");

  useEffect(() => {
    const init = async () => {
      let classToUse = student_class_id;

      // Fetch Profile to get Class and Student Name
      try {
        const profileRes = await fetch(`${localurl}student_dashboard_summary/${school_id}/${session_id}/${student_id}`);
        const profileData = await profileRes.json();
        if (profileData.success) {
          if (profileData.data.profile.registerClass) {
            classToUse = profileData.data.profile.registerClass;
          }
          if (profileData.data.profile.student_name) {
            setStudentName(profileData.data.profile.student_name);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }

      if (school_id && session_id && classToUse && classToUse !== "undefined") {
        fetchWork(classToUse);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [school_id, session_id, student_class_id, student_id]);

  const fetchWork = async (classId) => {
    setLoading(true);
    try {
      const res = await fetch(`${localurl}get_student_work/${school_id}/${session_id}/${classId}`);
      const data = await res.json();
      if (data.success) {
        setWorkList(data.row || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWork = workList.filter(w =>
    w.title?.toLowerCase().includes(search.toLowerCase()) ||
    w.teacher_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 🔷 RESPONSIVE CLEAN HEADER */}
        <div className="bg-transparent md:bg-white p-2 md:p-6 rounded-xl md:border md:border-slate-100 flex flex-col gap-4 md:gap-6 mb-4 md:mb-6 transition-all">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="px-1 md:px-0">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Academic Work</h1>
              <p className="text-slate-400 text-[10px] md:text-[13px] font-medium uppercase md:capitalize tracking-widest md:tracking-normal mt-1 md:mt-2">
                <span className="md:hidden">Assignments & Homework</span>
                <span className="hidden md:inline">Review your latest class assignments & homework materials.</span>
              </p>
            </div>

            <div className="hidden md:flex bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 items-center gap-3 transition-all">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Active Account</span>
                <span className="text-sm font-black text-slate-800 tracking-tight capitalize">{studentName.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="relative md:max-w-xs">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-white md:bg-slate-50 border border-slate-100 focus:border-blue-600 rounded-xl outline-none text-xs transition-all placeholder:text-slate-300 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 📋 ASSIGNMENT LISTING */}
        <div className="space-y-5 pb-12">
          {loading ? (
            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 flex flex-col items-center gap-5 shadow-sm">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Work...</p>
            </div>
          ) : filteredWork.length > 0 ? (
            <>
              {/* Desktop View Table (Legacy Project Format) */}
              <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-[#0064d1] text-white">
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border border-slate-200 w-16">#</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border border-slate-200">Posted Date</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border border-slate-200 text-left">Assignment Details</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border border-slate-200">Faculty</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border border-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredWork.map((work, index) => (
                        <tr key={work.id} className="hover:bg-blue-50/30 transition-colors even:bg-slate-50/50">
                          <td className="px-4 py-4 text-sm font-medium text-slate-500 border border-slate-200">{index + 1}</td>
                          <td className="px-4 py-4 whitespace-nowrap border border-slate-200">
                            <span className="text-sm font-bold text-slate-600">
                              {new Date(work.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-left border border-slate-200">
                            <div className="max-w-xl">
                              <p className="text-sm font-black text-blue-600 mb-1">{work.title}</p>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                {work.description || "No specific instructions provided."}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 border border-slate-200">
                            <span className="text-sm font-bold text-slate-700">{work.teacher_name || "Faculty"}</span>
                          </td>
                          <td className="px-4 py-4 border border-slate-200">
                            {work.file_path ? (
                              <a
                                href={`${imageBase}uploads/employee/${work.file_path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-4 py-1.5 bg-[#0064d1] text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No File</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View Cards (100% Perfect UI) */}
              <div className="md:hidden space-y-6">
                {filteredWork.map((work, index) => (
                  <div key={work.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/10 flex flex-col gap-6 relative overflow-hidden group">
                    {/* Visual Accent */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-80"></div>

                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Assignment #{index + 1}</span>
                        <h4 className="font-black text-slate-900 text-lg leading-tight tracking-tight">{work.title}</h4>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[50px]">
                        <span className="text-[11px] font-black text-slate-900 leading-none">
                          {new Date(work.date).getDate()}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {new Date(work.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-4">
                        {work.description || "Please review the class materials for detailed instructions on this task."}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                          <FaUserTie size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none capitalize">{work.teacher_name?.toLowerCase() || "Faculty Member"}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Department Head</span>
                        </div>
                      </div>

                      {work.file_path ? (
                        <a
                          href={`${imageBase}uploads/employee/${work.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">No File</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-24 rounded-[3.5rem] border border-slate-100 text-center shadow-xl shadow-slate-200/10">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <FaBookOpen size={40} className="text-slate-200" />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">No Active Work</h3>
              <p className="text-sm text-slate-400 mt-3 font-medium max-w-xs mx-auto">You're all caught up! There are no assignments to review at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWork;
