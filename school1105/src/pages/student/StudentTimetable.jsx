
// import React, { useState, useEffect } from "react";
// import { localurl } from "../../api/api";
// import { User, Printer, Clock, BookOpen, MapPin } from "lucide-react";

// const StudentTimetable = () => {
//   const [timetable, setTimetable] = useState([]);
//   const [periods, setPeriods] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [studentInfo, setStudentInfo] = useState(null);

//   const authRole = (localStorage.getItem("authRole") || "").toLowerCase();
//   const school_id = localStorage.getItem("school_id");
//   const session_id = localStorage.getItem("session_id");
//   const student_id = localStorage.getItem("student_id");
//   const student_class_id = localStorage.getItem("student_class_id");
//   const authData = JSON.parse(localStorage.getItem("authData") || "{}");
//   const sessionData = JSON.parse(localStorage.getItem("session_data") || "{}");

//   useEffect(() => {
//     if (school_id && session_id) {
//       init();
//     }
//   }, [school_id, session_id, student_id]);

//   const init = async () => {
//     setLoading(true);
//     await getMasters();

//     if (authRole === "student" && student_id) {
//       let classToFetch = student_class_id;
//       if (!classToFetch || classToFetch === "undefined" || classToFetch === "null") {
//         try {
//           const response = await fetch(`${localurl}student/${student_id}`);
//           const data = await response.json();
//           if (data.success && data.data.registerClass) {
//             classToFetch = data.data.registerClass;
//             setStudentInfo(data.data);
//           }
//         } catch (error) { }
//       } else {
//         try {
//           const response = await fetch(`${localurl}student/${student_id}`);
//           const data = await response.json();
//           if (data.success) {
//             setStudentInfo(data.data);
//           }
//         } catch (error) { }
//       }
//       if (classToFetch) await fetchTimetable(classToFetch);
//     } else {
//       await fetchAllAllotments();
//     }
//     setLoading(false);
//   };

//   const getMasters = async () => {
//     try {
//       const [empRes, periodRes, subRes, classRes] = await Promise.all([
//         fetch(localurl + "employee/" + school_id + "/" + session_id),
//         fetch(localurl + "period/" + school_id),
//         fetch(localurl + "subject/" + school_id),
//         fetch(localurl + "class_section/" + school_id)
//       ]);

//       const empData = await empRes.json();
//       const periodData = await periodRes.json();
//       const subData = await subRes.json();
//       const classData = await classRes.json();

//       setEmployees(empData.row || []);
//       if (periodData.row) {
//         setPeriods(periodData.row.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
//       }
//       setSubjects(subData.rows || subData.row || []);
//       setClasses(classData.row || []);
//     } catch (error) { }
//   };

//   const fetchTimetable = async (class_id) => {
//     try {
//       const res = await fetch(localurl + `student_timetable/${school_id}/${session_id}/${class_id}`);
//       const data = await res.json();
//       if (data.success) {
//         setTimetable(data.data || []);
//       }
//     } catch (err) { }
//   };

//   const fetchAllAllotments = async () => {
//     try {
//       const res = await fetch(localurl + `staff_period_allot/${school_id}/${session_id}`);
//       const data = await res.json();
//       if (data.success) {
//         setTimetable(data.row || []);
//       }
//     } catch (err) { }
//   };

//   const getStaffName = (id) => employees.find(e => e.id == id)?.employeeFullName || "-";
//   const getSubjectName = (id) => subjects.find(s => s.id == id)?.subject_name || "-";

//   const handlePrint = () => {
//     window.print();
//   };

//   const getSubjectColor = (id) => {
//     const colors = [
//       "bg-[#FCE7F3] text-rose-700 border-rose-200",
//       "bg-[#E0F2FE] text-blue-700 border-blue-200",
//       "bg-[#F3E8FF] text-purple-700 border-purple-200",
//       "bg-[#FEF3C7] text-amber-700 border-amber-200",
//       "bg-[#DCFCE7] text-emerald-700 border-emerald-200",
//       "bg-[#FFEDD5] text-orange-700 border-orange-200",
//     ];
//     return colors[id % colors.length];
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0860C4]"></div>
//       </div>
//     );
//   }

//   const classesToShow = authRole === "student"
//     ? (studentInfo ? [{ id: studentInfo.registerClass, class_name: studentInfo.section_class, section: studentInfo.section || "" }] : [])
//     : classes;

//   return (

//     <div className=" min-h-screen">


//       <div className="flex justify-between items-end">
//         <div>
//           <h2 className="text-xl font-semibold ">Class Time-table</h2>
//         </div>
//         <button
//           onClick={handlePrint}
//           className="hidden md:flex w-auto bg-[#0860C4] text-white px-6 py-3 rounded-xl font-bold items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-md active:scale-95 text-xs no-print"
//         >
//           <Printer size={14} className="md:w-4 md:h-4" />
//           <span>Print Schedule</span>
//         </button>
//       </div>


//       <div className=" max-w-[1400px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print-area">

//         {/* School Branding Header */}
//         {/* <div className="relative  border-b border-gray-100 text-center bg-slate-50/50">
//           {authData.upload_logo && (
//             <img
//               src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${import.meta.env.VITE_SERVER_URL}/uploads/${authData.upload_logo}`}
//               className="w-20 h-20 object-contain mx-auto mb-4"
//               alt="Logo"
//             />
//           )}
//           <h1 className="!text-[26px] !font-bold text-gray-900 uppercase !tracking-tighter mb-1 leading-none">
//             {authData.school_name}
//           </h1>
//           <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[2px]">
//             {authData.address || authData.school_address}
//           </p>
//         </div> */}

//         {/* Timetable Grid */}
//         <div className="hidden md:block overflow-x-auto w-full">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-white border-b border-gray-200">
//                 <th className="p-0 border-r border-gray-200 bg-white sticky left-0 z-20 w-[80px] overflow-hidden">
//                   <div className="relative h-[60px] w-full bg-white">
//                     <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
//                       <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e2e8f0" strokeWidth="1.5" />
//                     </svg>
//                     <div className="absolute top-3 right-3 text-[10px] font-bold text-[#0860C4] uppercase tracking-widest text-right">
//                       Period
//                     </div>
//                     <div className="absolute bottom-3 left-3 text-[10px] font-bold text-[#0860C4] uppercase tracking-widest text-left">
//                       Classes
//                     </div>
//                   </div>
//                 </th>
//                 {periods.map((p) => (
//                   <th key={p.id} className=" text-center border-r border-gray-200 bg-slate-50/30 w-[80px]">
//                     <div className="flex flex-col items-center gap-1">
//                       <span className="text-[#0860C4] font-bold text-sm">
//                         {p.period}
//                       </span>
//                       <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-md border border-gray-100 shadow-sm">
//                         <Clock size={10} className="text-gray-400" />
//                         <span className="text-[11px] font-bold text-gray-600">
//                           {p.start_time} - {p.end_time}
//                         </span>
//                       </div>
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {classesToShow.length > 0 ? (
//                 classesToShow.map(cls => (
//                   <tr key={cls.id} className="hover:bg-blue-50/20 transition-colors group">
//                     <td className="p-2 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-blue-50/20 z-10 transition-colors">
//                       <div className="flex items-center gap-2">
//                         <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-[#0860C4]">
//                           <BookOpen size={16} />
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <div className="font-bold text-gray-900 text-[14px] whitespace-nowrap">{cls.class_name}</div>
//                           <div className="font-bold text-gray-900 text-[14px] whitespace-nowrap">{cls.section || ""}</div>
//                         </div>
//                       </div>
//                     </td>
//                     {periods.map(p => {
//                       const allot = timetable.find(t =>
//                         t.period_id == p.id &&
//                         (authRole === "student" ? true : t.class_id == cls.id)
//                       );
//                       const cellStyles = allot ? getSubjectColor(allot.subject_id) : "";

//                       return (
//                         <td key={p.id} className="p-1 border-r border-gray-100 last:border-r-0 h-18 min-w-[100px]">
//                           {allot ? (
//                             <div className={`h-fit py-2.5 px-3 mx-auto w-fit min-w-[110px] flex flex-col items-center justify-center rounded-lg border shadow-sm transition-all hover:scale-[1.02] ${cellStyles}`}>
//                               <span className="text-[11px] font-bold uppercase leading-tight text-center line-clamp-1">
//                                 {getSubjectName(allot.subject_id)}
//                               </span>
//                               <div className="flex items-center gap-1 py-0 px-1 bg-white/40 rounded backdrop-blur-sm border border-white/50 shadow-inner">
//                                 <div className="text-[9px] font-bold uppercase tracking-tight flex items-center gap-1">
//                                   <User size={8} />
//                                   <span className="truncate max-w-[90px]">
//                                     {getStaffName(allot.staff_id || allot.teacher_id)}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="h-full flex items-center justify-center opacity-10">
//                               <div className="w-2 h-2 rounded-full bg-slate-300"></div>
//                             </div>
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={periods.length + 1} className="py-20 text-center">
//                     <div className="flex flex-col items-center opacity-40">
//                       <BookOpen size={48} className="mb-2" />
//                       <p className="font-bold text-lg">No timetable data found.</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>


//       </div>

//       {/* 🔷 MOBILE TIMELINE VIEW */}
//       <div className="block md:hidden space-y-3.5 pb-24 mt-5">
//         {periods.length > 0 ? (
//           periods.map((p, idx) => {
//             const allotment = timetable.find(t => t.period_id == p.id);
//             const subjectName = allotment
//               ? subjects.find(s => s.id == allotment.subject_id)?.subject_name || "Subject"
//               : "Free Period";
//             const staffName = allotment
//               ? employees.find(e => e.id == (allotment.staff_id || allotment.teacher_id))?.employeeFullName || "Instructor"
//               : "No class assigned";
//             const subjectStyle = allotment
//               ? getSubjectColor(allotment.subject_id)
//               : "bg-slate-50 text-slate-500 border-slate-200";
//             return (
//               <div
//                 key={p.id}
//                 className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] active:scale-[0.985] transition-transform"
//               >
//                 <div className={`absolute left-0 top-0 h-full w-1.5 ${allotment ? subjectStyle.split(" ")[0] : "bg-slate-200"}`}></div>

//                 {allotment ? (
//                   <div className="p-4 pl-5">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="flex items-center gap-2">
//                           <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
//                             {p.period || `Period ${idx + 1}`}
//                           </span>
//                           <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${subjectStyle}`}>
//                             Class
//                           </span>
//                         </div>
//                         <h4 className="mt-3 text-[17px]  leading-tight text-slate-900">
//                           {subjectName}
//                         </h4>
//                       </div>

//                       <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-right ring-1 ring-blue-100">
//                         <div className="flex items-center justify-end gap-1 text-[#0860C4]">
//                           <Clock size={12} />
//                           <span className="text-[10px] font-black uppercase">Time</span>
//                         </div>
//                         <p className="mt-0.5 text-[11px] font-black text-slate-800">
//                           {p.start_time} - {p.end_time}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="mt-4 grid grid-cols-2 gap-2">
//                       <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
//                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0860C4] shadow-sm">
//                           <User size={15} />
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Teacher</p>
//                           <p className="truncate text-[12px] font-bold text-slate-800">{staffName}</p>
//                         </div>
//                       </div>

//                       <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
//                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
//                           <MapPin size={15} />
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Room</p>
//                           <p className="truncate text-[12px] font-bold text-slate-800">{allotment.room_no || "N/A"}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="p-4 pl-5">
//                     <div className="flex items-center justify-between gap-3">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
//                           <BookOpen size={18} />
//                         </div>
//                         <div>
//                           <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
//                             {p.period || `Period ${idx + 1}`}
//                           </p>
//                           <h4 className="text-[15px] font-black text-slate-700">{subjectName}</h4>
//                         </div>
//                       </div>

//                       <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right ring-1 ring-slate-100">
//                         <div className="flex items-center justify-end gap-1 text-slate-400">
//                           <Clock size={12} />
//                           <span className="text-[10px] font-black uppercase">Time</span>
//                         </div>
//                         <p className="mt-0.5 text-[11px] font-black text-slate-600">
//                           {p.start_time} - {p.end_time}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         ) : (
//           <div className="py-20 text-center bg-white rounded-lg border border-dashed border-slate-200">
//             <Clock size={40} className="mx-auto text-slate-200 mb-3" />
//             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Schedule Found</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentTimetable;





// is ko 08-06-2026 class add kiya hai 





















import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { User, Download, Clock, BookOpen, MapPin } from "lucide-react";
import { FloatingSelect } from "../../Component/common/FloatingInput";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [filters, setFilters] = useState({ class: "Select Class Section" });
  const [schoolInfo, setSchoolInfo] = useState(null);

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

  useEffect(() => {
    if (!school_id) return;
    fetch(`${localurl}all_school`)
      .then(res => res.json())
      .then(data => {
        if (data && data.row && data.row.length > 0) {
          const currentSchool = data.row.find(s => String(s.id) === String(school_id)) || data.row[0];
          if (currentSchool) {
            setSchoolInfo(currentSchool);
            localStorage.setItem("school", JSON.stringify(currentSchool));
          }
        }
      })
      .catch(err => console.error("Error fetching school info:", err));
  }, [school_id]);

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
      if (classToFetch) {
        await fetchTimetable(classToFetch);
        setSelectedClassId(String(classToFetch));
      }
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
      setClasses(classData.row
        .filter((item) => item.status === "Active")
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || []);
    } catch (error) { }
  };

  useEffect(() => {
    if (authRole === "student" && studentInfo && studentInfo.registerClass) {
      setSelectedClassId(String(studentInfo.registerClass));
      setFilters({
        class: `${studentInfo.section_class} ${studentInfo.section || ""}`
      });
    }
  }, [studentInfo]);

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

  const getBase64Image = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      };
      img.src = url;
    });
  };

  // const exportPDF = async () => {
  //   try {
  //     const doc = new jsPDF("l", "mm", "a4");
  //     const school = schoolInfo || JSON.parse(localStorage.getItem("school") || "{}");

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 15;

  //     const colors = {
  //       primary: [8, 96, 196],      // #0860C4
  //       secondary: [100, 116, 139], // Slate 500
  //       border: [226, 232, 240],    // Slate 200
  //       light: [248, 250, 252],     // Slate 50
  //       text: [30, 41, 59]          // Slate 800
  //     };

  //     let logoUrl = authData.upload_logo || school?.upload_logo;
  //     let logoData = null;

  //     if (logoUrl) {
  //       const serverBase = (import.meta.env.VITE_SERVER_URL || "http://localhost:8000").replace(/\/$/, "");
  //       const possibleUrls = [
  //         logoUrl.startsWith('data:') || logoUrl.startsWith('http') ? logoUrl : `${serverBase}/uploads/${logoUrl}`,
  //         logoUrl.startsWith('data:') || logoUrl.startsWith('http') ? logoUrl : `${serverBase}/${logoUrl}`,
  //         `${window.location.origin}/uploads/${logoUrl}`
  //       ];

  //       for (const url of possibleUrls) {
  //         try {
  //           logoData = await getBase64Image(url);
  //           if (logoData) break;
  //         } catch (e) {
  //           console.warn(`Failed to load logo from ${url}`);
  //         }
  //       }
  //     }

  //     const drawHeader = (doc) => {
  //       const sName = (school?.school_name ||
  //         school?.schoolName ||
  //         school?.name ||
  //         authData.school_name ||
  //         "SCHOOL TIMETABLE").toUpperCase();
  //       const logoSize = 20;
  //       const topY = 10;
        
  //       const gap = 4;

  //       if (logoData) {
  //         doc.setFont("helvetica", "bold");
  //         doc.setFontSize(16);
  //         const nameWidth = doc.getTextWidth(sName);
  //         const totalHeaderWidth = logoSize + gap + nameWidth;
  //         const startX = (pageWidth - totalHeaderWidth) / 2;

  //         doc.addImage(logoData, "PNG", startX, topY, logoSize, logoSize);

  //         const textX = startX + logoSize + gap;
  //         doc.setTextColor(...colors.primary);
  //         doc.text(sName, textX, topY + 12);

  //         const nameCenter = textX + (nameWidth / 2);
  //         doc.setFont("helvetica", "normal");
  //         doc.setFontSize(8.5);
  //         doc.setTextColor(...colors.secondary);
  //         const addr = (school?.address || authData.address || "").toUpperCase();
  //         doc.text(addr, nameCenter, topY + 18, { align: "center" });
  //       } else {
  //         doc.setFont("helvetica", "bold");
  //         doc.setFontSize(18);
  //         doc.setTextColor(...colors.primary);
  //         doc.text(sName, pageWidth / 2, topY + 12, { align: "center" });

  //         doc.setFont("helvetica", "normal");
  //         doc.setFontSize(9);
  //         doc.setTextColor(...colors.secondary);
  //         const addr = (school?.address || authData.address || "").toUpperCase();
  //         doc.text(addr, pageWidth / 2, topY + 18, { align: "center" });
          
  //       }

  //       doc.setDrawColor(...colors.border);
  //       doc.setLineWidth(0.5);
  //       doc.line(margin, topY + 23, pageWidth - margin, topY + 23);

  //       doc.setFontSize(11);
  //       doc.setFont("helvetica", "bold");
  //       doc.setTextColor(...colors.primary);
  //       const subtitle = authRole === "student"
  //         ? `WEEKLY CLASS TIMETABLE - Class: ${studentInfo?.section_class} ${studentInfo?.section || ""}`
  //         : `WEEKLY CLASS TIMETABLE - Section: ${filters.class}`;
  //       doc.text(subtitle, pageWidth / 2, topY + 30, { align: "center" });
  //     };

  //     drawHeader(doc);

  //     const tableColumns = [
  //       "Class Section",
  //       ...periods.map(p => `${p.period}\n(${p.start_time} - ${p.end_time})`)
  //     ];

  //     const tableRows = classesToShow.map(cls => {
  //       const row = [`${cls.class_name} ${cls.section || ""}`];
  //       periods.forEach(p => {
  //         const allot = timetable.find(t =>
  //           t.period_id == p.id &&
  //           (authRole === "student" ? true : t.class_id == cls.id)
  //         );
  //         if (allot) {
  //           const subName = getSubjectName(allot.subject_id);
  //           const tName = getStaffName(allot.staff_id || allot.teacher_id);
  //           const rNo = allot.room_no ? `\nRoom: ${allot.room_no}` : "";
  //           row.push(`${subName}\n(${tName})${rNo}`);
  //         } else {
  //           row.push("-");
  //         }
  //       });
  //       return row;
  //     });

  //     autoTable(doc, {
  //       startY: 45,
  //       head: [tableColumns],
  //       body: tableRows,
  //       theme: "grid",
  //       headStyles: {
  //         fillColor: colors.primary,
  //         textColor: 255,
  //         fontSize: 9,
  //         fontStyle: "bold",
  //         halign: "center",
  //         valign: "middle"
  //       },
  //       bodyStyles: {
  //         fontSize: 8,
  //         textColor: colors.text,
  //         halign: "center",
  //         valign: "middle"
  //       },
  //       alternateRowStyles: {
  //         fillColor: [250, 252, 255]
  //       },
  //       didDrawPage: (data) => {
  //         if (data.pageNumber > 1) {
  //           drawHeader(doc);
  //         }
  //         doc.setFontSize(8);
  //         doc.setTextColor(...colors.secondary);
  //         doc.text(
  //           `Generated on ${new Date().toLocaleDateString()} | Page ${data.pageNumber}`,
  //           pageWidth / 2,
  //           pageHeight - 10,
  //           { align: "center" }
  //         );
  //       },
  //       margin: { left: margin, right: margin, bottom: 20 }
  //     });

  //     const pdfName = `Timetable_${(filters.class || "Schedule").replace(/\s+/g, "_")}.pdf`;
  //     doc.save(pdfName);
  //   } catch (error) {
  //     console.error("Failed to generate PDF:", error);
  //   }
  // };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilters({ class: val });
    if (val === "All") {
      setSelectedClassId("All");
    } else if (val === "" || val === "Select Class Section") {
      setSelectedClassId("");
    } else {
      const match = classes.find(c => `${c.class_name} ${c.section}` === val);
      setSelectedClassId(match ? String(match.id) : "");
    }
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
    : (selectedClassId === "All" ? classes : (selectedClassId ? classes.filter(cls => cls.id == selectedClassId) : []));

  return (
    <section className="bg-white rounded-t-2xl max-w-full p-4">
      <div className="min-h-screen">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 no-print">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Class Time-table</h2>
            {authRole !== "student" && (
              <p className="text-xs text-gray-500 mt-1">Select a class section to view its weekly schedule</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {authRole === "student" ? (
              studentInfo && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 shadow-sm">
                  <span className="text-xs font-bold text-blue-600 uppercase">Class:</span>
                  <span className="text-sm font-bold text-blue-900">
                    {studentInfo.section_class} {studentInfo.section ? ` - ${studentInfo.section}` : ""}
                  </span>
                </div>
              )
            ) : (
              <div className="col-span-12 md:col-span-2 min-w-[200px]">
                <FloatingSelect
                  label="Class Section"
                  name="class"
                  value={filters.class}
                  onChange={handleFilterChange}
                  options={[
                    "Select Class Section",
                    "All",
                    ...classes.map(
                      (record) => `${record.class_name} ${record.section}`
                    ),
                  ]}
                />
              </div>
            )}

            {/* <button
              onClick={exportPDF}
              disabled={!selectedClassId}
              className="flex w-auto bg-[#0860C4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-bold items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-md active:scale-95 text-xs"
            >
              <Download size={14} />
              <span>Download Schedule</span>
            </button> */}
          </div>
        </div>

        {!selectedClassId ? (
          <div className="max-w-[1400px] hidden md:block mx-auto bg-white  border border-gray-100 p-16 text-center mt-5">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0860C4] mb-4 shadow-inner">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Class Selected</h3>
              <p className="text-sm text-gray-500 mt-2">
                Please select a class section from the dropdown above to view the timetable schedule.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden print-area hidden md:block">
              {/* Timetable Grid */}
              <div className="overflow-x-auto ">
                <table className="min-w-full table-auto border">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="p-0  border bg-white sticky left-0 z-20 w-[80px] overflow-hidden">
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
                        <th key={p.id} className="text-center  border bg-slate-50/30 w-[80px]">
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
                          <td className="p-2 border sticky left-0 bg-white group-hover:bg-blue-50/20 z-10 transition-colors">
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
                              <td key={p.id} className="p-1 border last:border-r-0 h-18 min-w-[100px]">
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
            <div className="block md:hidden space-y-3.5  mt-5">
              {periods.length > 0 ? (
                periods.map((p, idx) => {
                  const allotment = timetable.find(t =>
                    t.period_id == p.id &&
                    (authRole === "student" ? true : (selectedClassId === "All" ? true : t.class_id == selectedClassId))
                  );
                  const subjectName = allotment
                    ? subjects.find(s => s.id == allotment.subject_id)?.subject_name || "Subject"
                    : "Free Period";
                  const staffName = allotment
                    ? employees.find(e => e.id == (allotment.staff_id || allotment.teacher_id))?.employeeFullName || "Instructor"
                    : "No class assigned";
                  const subjectStyle = allotment
                    ? getSubjectColor(allotment.subject_id)
                    : "bg-slate-50 text-slate-500 border-slate-200";
                  return (
                    <div
                      key={p.id}
                      className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] active:scale-[0.985] transition-transform"
                    >
                      <div className={`absolute left-0 top-0 h-full w-1.5 ${allotment ? subjectStyle.split(" ")[0] : "bg-slate-200"}`}></div>

                      {allotment ? (
                        <div className="p-4 pl-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                  {p.period || `Period ${idx + 1}`}
                                </span>
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${subjectStyle}`}>
                                  Class
                                </span>
                              </div>
                              <h4 className="mt-3 text-[17px] leading-tight text-slate-900">
                                {subjectName}
                              </h4>
                            </div>

                            <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-right ring-1 ring-blue-100">
                              <div className="flex items-center justify-end gap-1 text-[#0860C4]">
                                <Clock size={12} />
                                <span className="text-[10px] font-black uppercase">Time</span>
                              </div>
                              <p className="mt-0.5 text-[11px] font-black text-slate-800">
                                {p.start_time} - {p.end_time}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0860C4] shadow-sm">
                                <User size={15} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Teacher</p>
                                <p className="truncate text-[12px] font-bold text-slate-800">{staffName}</p>
                              </div>
                            </div>

                            <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                <MapPin size={15} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Room</p>
                                <p className="truncate text-[12px] font-bold text-slate-800">{allotment.room_no || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 pl-5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <BookOpen size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  {p.period || `Period ${idx + 1}`}
                                </p>
                                <h4 className="text-[15px] font-black text-slate-700">{subjectName}</h4>
                              </div>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right ring-1 ring-slate-100">
                              <div className="flex items-center justify-end gap-1 text-slate-400">
                                <Clock size={12} />
                                <span className="text-[10px] font-black uppercase">Time</span>
                              </div>
                              <p className="mt-0.5 text-[11px] font-black text-slate-600">
                                {p.start_time} - {p.end_time}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-white rounded-lg border border-dashed border-slate-200">
                  <Clock size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Schedule Found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default StudentTimetable;
