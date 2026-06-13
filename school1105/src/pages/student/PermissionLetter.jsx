import React, { useState, useEffect } from "react";
import { ClassSelect, FloatingInput } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { Printer, Search } from "lucide-react";

const PermissionLetter = () => {
    const [sectionList, setSectionList] = useState([]);
    const [examList, setExamList] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authData, setAuthData] = useState(JSON.parse(localStorage.getItem("authData") || "{}"));
    const [sessionData, setSessionData] = useState(JSON.parse(localStorage.getItem("session_data") || "{}"));

    const [form, setForm] = useState({
        class_id: "",
        exam_id: "",
        searchTerm: "",
    });

    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    useEffect(() => {
        if (school_id) {
            fetchInitialData();
        }
    }, [school_id]);

    const fetchInitialData = async () => {
        try {
            // Fetch Classes
            const classRes = await fetch(localurl + "class_section/" + school_id);
            const classData = await classRes.json();
            if (classData.success) {
                setSectionList(classData.row.filter(c => c.status === "Active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            }

            // Fetch Exams
            const examRes = await fetch(localurl + "main_exam/" + school_id + "/" + session_id);
            const examData = await examRes.json();
            if (examData.success) {
                setExamList(examData.row.filter(e => e.status === "Active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const handleFind = async () => {
        if (!form.class_id || !form.exam_id) {
            alert("Please select both Class and Exam");
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch Students
            const stuRes = await fetch(`${localurl}students/${school_id}/${session_id}`);
            const stuData = await stuRes.json();

            // 2. Fetch Timetable
            const timeRes = await fetch(`${localurl}exam_timetable/${school_id}/${session_id}/${form.class_id}/${form.exam_id}`);
            const timeData = await timeRes.json();

            if (stuData.success && timeData.success) {
                let list = stuData.row || stuData.rows || [];

                // Only active students should receive permission letters.
                list = list.filter((s) => String(s.status || "").toLowerCase() === "active");

                // Filter by Class
                list = list.filter(s => s.registerClass == form.class_id);

                // Filter by Search Term
                if (form.searchTerm) {
                    const term = form.searchTerm.toLowerCase();
                    list = list.filter(s =>
                        (s.studentName && s.studentName.toLowerCase().includes(term)) ||
                        (s.fatherName && s.fatherName.toLowerCase().includes(term)) ||
                        (s.srNo && s.srNo.toString().includes(term)) ||
                        (s.student_ids && s.student_ids.toString().includes(term))
                    );
                }

                setFilteredStudents(list);
                setTimetable(timeData.row);
            } else if (!timeData.success) {
                alert("Exam Timetable not found for selected Class and Exam.");
                setFilteredStudents([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const getDayName = (dateStr) => {
        if (!dateStr) return "";
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const d = new Date(dateStr);
        return days[d.getDay()];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    };

    const toTitleCase = (str) => {
        if (!str) return "";
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="permission-print-page bg-white rounded-t-2xl max-w-full p-4 min-h-[80vh]">
            <style>{`
                @media print {
                    html,
                    body,
                    #root {
                        width: 100% !important;
                        min-width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-family: Arial, sans-serif !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .permission-print-page,
                    .permission-print-page * {
                        visibility: visible !important;
                    }

                    .permission-print-page {
                        position: absolute !important;
                        inset: 0 auto auto 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        min-height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        background: white !important;
                    }

                    .no-print { display: none !important; }

                    .print-area {
                        display: block !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .permission-card {
                        break-inside: avoid-page !important;
                        page-break-inside: avoid !important;
                        page-break-after: always !important;
                        border: 1px solid #ccc !important;
                        border-radius: 0 !important;
                        margin: 0 0 8mm 0 !important;
                        padding: 5mm !important;
                        width: 100% !important;
                        max-width: none !important;
                        box-shadow: none !important;
                    }

                    .permission-card:last-child {
                        page-break-after: auto !important;
                    }

                    .permission-card table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }

                    @page { size: A4 portrait; margin: 8mm; }
                }
            `}</style>

            <div className="no-print">
                <h2 className="text-xl font-bold mb-4 ">Student's Permission Letter</h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-end">
                    <ClassSelect
                        label="Class Section"
                        value={form.class_id}
                        onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                        options={[
                            { label: "Select Class Section", value: "" },
                            ...sectionList.map((c) => ({
                                label: `${c.class_name} - ${c.section}`,
                                value: c.id,
                            })),
                        ]}
                    />
                    <ClassSelect
                        label="Exam"
                        value={form.exam_id}
                        onChange={(e) => setForm({ ...form, exam_id: e.target.value })}
                        options={[
                            { label: "Select Exam", value: "" },
                            ...examList.map((e) => ({
                                label: e.exam_name,
                                value: e.id,
                            })),
                        ]}
                    />
                    <div className="lg:col-span-1">
                        <FloatingInput
                            label="Search"
                            value={form.searchTerm}
                            placeholder="Name, SR No, ID"
                            onChange={(e) => setForm({ ...form, searchTerm: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2 h-[42px]">
                        <button
                            onClick={handleFind}
                            className="bg-[#008236] hover:bg-green-700 text-white font-bold px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                        >
                            <Search size={16} />
                            Find
                        </button>

                        {filteredStudents.length > 0 && (
                            <button
                                onClick={handlePrint}
                                className="bg-[#E14D43] hover:bg-red-700 text-white font-bold px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                            >
                                <Printer size={16} />
                                Print
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Permission Letters Area */}
            <div className="print-area space-y-8">
                {filteredStudents.map((student, index) => {
                    const examName = examList.find(e => e.id == form.exam_id)?.exam_name || "";
                    const className = sectionList.find(c => c.id == form.class_id)?.class_name || "";
                    const sectionName = sectionList.find(c => c.id == form.class_id)?.section || "";

                    return (
                        // <div key={index} className="permission-card border border-gray-300 rounded-xl p-4 bg-white shadow-sm relative max-w-4xl mx-auto">
                        <div
                            key={index}
                            className="permission-card border border-gray-300 rounded-xl p-4 bg-white shadow-sm relative max-w-4xl mx-auto font-[Arial]"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-3">
                                {authData.upload_logo && (
                                    <img
                                        src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${localurl.replace('/api/', '')}/uploads/${authData.upload_logo}`}
                                        alt="Logo"
                                        className="w-14 h-14 object-contain"
                                    />
                                )}
                                <div className="flex-1 text-center">
                                    <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-0.5">
                                        <span>Reg. No. : {authData.registration_no || "-"}</span>
                                        <span>Affi. No. : {authData.affiliation_no || "-"}</span>
                                    </div>
                                    {/* <h3 className="text-lg font-black text-blue-900 uppercase leading-none mb-0.5">{authData.school_name}</h3> */}
                                    <h3 className="text-[19px] font-bold tracking-normal text-[#1d3f91] uppercase leading-tight mb-[2px]">{authData.school_name}</h3>
                                    {/* <p className="text-[10px] font-bold text-gray-700 uppercase leading-tight mb-0.5">{authData.address}</p> */}
                                    <p className="text-[11px] font-semibold text-gray-700 uppercase leading-tight mb-[2px]">{authData.address}</p>
                                    <p className="text-[10px] font-semibold italic text-gray-600">Contact No. : {authData.mobile_no || authData.helpLine_no}</p>
                                </div>
                            </div>

                            {/* Title Bar - Gray like reference */}
                            <div className="bg-slate-100 py-1 mb-4 text-center rounded border-y border-slate-200">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                                    Permission Letter For {examName} {sessionData.session_name}
                                </h4>
                            </div>

                            {/* Student Info with Photo Box */}
                            <div className="flex gap-6 mb-2 items-start">
                                {/* Details Grid */}
                                <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-8 text-[11px] mt-1">
                                    <div className="flex items-center gap-2 border-b border-dotted border-gray-300 pb-0.5">
                                        <span className="text-[12px] font-bold text-gray-700 uppercase whitespace-nowrap">
                                            Student Name:
                                        </span>

                                        <span className="text-[13px] font-semibold text-[#1f2937]">
                                            {toTitleCase(student.studentName)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 border-b border-dotted border-gray-300 pb-0.5">
                                        <span className="text-[12px] font-bold text-gray-700 uppercase whitespace-nowrap">
                                            Father Name:
                                        </span>

                                        <span className="text-[13px] font-semibold text-[#1f2937]">
                                            {toTitleCase(student.fatherName)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 border-b border-dotted border-gray-300 pb-0.5">
                                        <span className="text-[12px] font-bold text-gray-700 uppercase whitespace-nowrap">
                                            Roll No. :
                                        </span>

                                        <span className="text-[13px] font-semibold text-[#1f2937]">
                                            {student.student_ids || student.srNo}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 border-b border-dotted border-gray-300 pb-0.5">
                                        <span className="text-[12px] font-bold text-gray-700 uppercase whitespace-nowrap">
                                            Class :
                                        </span>

                                        <span className="text-[13px] font-semibold text-[#1f2937]">
                                            {className} - {sectionName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 border-b border-dotted border-gray-300 pb-0.5">
                                        <span className="text-[12px] font-bold text-gray-700 uppercase whitespace-nowrap">
                                            Student ID:
                                        </span>

                                        <span className="text-[13px] font-semibold text-[#1f2937]">
                                            {student.stu_prefix}{student.srId}
                                        </span>
                                    </div>
                                </div>

                                {/* Photo Box - Compact Size */}
                                <div className="w-[100px] h-[100px] border border-gray-400 rounded flex flex-col items-center justify-center bg-white overflow-hidden shrink-0 shadow-sm mr-2">
                                    {student.photo ? (
                                        <img
                                            src={student.photo.startsWith("data:") ? student.photo : `${localurl.replace('/api/', '')}/uploads/employee/${student.photo}`}
                                            alt="Student"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-[6px] font-bold text-gray-400 text-center uppercase leading-tight px-1">
                                            Passport Size<br />Photo
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timetable Table - Gray Header like reference */}
                            <div className="overflow-hidden border border-gray-300 rounded-md mb-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                                        <tr className="divide-x divide-gray-300">
                                            <th className="px-2 py-1.5 text-left text-[9px] font-black !text-slate-800 uppercase !bg-[#f1f5f9]">S. No.</th>
                                            <th className="px-2 py-1.5 text-left text-[9px] font-black !text-slate-800 uppercase !bg-[#f1f5f9]">Subject</th>
                                            <th className="px-2 py-1.5 text-left text-[9px] font-black !text-slate-800 uppercase !bg-[#f1f5f9]">Date</th>
                                            <th className="px-2 py-1.5 text-left text-[9px] font-black !text-slate-800 uppercase !bg-[#f1f5f9]">Start Time</th>
                                            <th className="px-2 py-1.5 text-left text-[9px] font-black !text-slate-800 uppercase !bg-[#f1f5f9]">End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {timetable.map((item, idx) => (
                                            <tr key={idx} className="divide-x divide-gray-200">
                                                <td className="px-2 py-1 text-[10px] text-gray-900 font-medium">{idx + 1}</td>
                                                <td className="px-2 py-1 text-[10px] text-gray-900 font-medium">{toTitleCase(item.subject_name)}</td>
                                                <td className="px-2 py-1 text-[10px] text-gray-900 font-medium">
                                                    {formatDate(item.exam_date)} ({getDayName(item.exam_date)})
                                                </td>
                                                <td className="px-2 py-1 text-[10px] text-gray-900 font-medium">{item.start_time}</td>
                                                <td className="px-2 py-1 text-[10px] text-gray-900 font-medium">{item.end_time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures */}
                            <div className="flex justify-between items-end mt-4 px-2">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-800 uppercase">Class Teacher</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-800 uppercase">Principal</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="no-print flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0860C4]"></div>
                </div>
            )}

            {!loading && filteredStudents.length === 0 && (
                <div className="no-print text-center py-20 text-gray-400 italic">
                    Select Class and Exam, then click "Find" to generate permission letters.
                </div>
            )}
        </div>
    );
};

export default PermissionLetter;
