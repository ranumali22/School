import React, { useState, useEffect } from "react";
import { localurl } from "../../api/api";
import { FaGraduationCap, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaChartLine, FaFlask, FaMicrophoneAlt, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SingleStudentMainExamReport = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [stats, setStats] = useState({
        totalExams: 0,
        averageMarks: 0,
        passCount: 0
    });

    useEffect(() => {
        const authData = JSON.parse(localStorage.getItem("authData"));
        if (authData) {
            fetchReport(authData.school_id, authData.session_id, authData.id);
            fetchSchoolInfo(authData.school_id);
        }
    }, []);

    const fetchSchoolInfo = (school_id) => {
        fetch(`${localurl}all_school`)
            .then(res => res.json())
            .then(data => {
                if (data && data.row) {
                    const currentSchool = data.row.find(s => String(s.id) === String(school_id));
                    setSchoolInfo(currentSchool);
                }
            })
            .catch(console.error);
    };

    const fetchReport = (schoolId, sessionId, studentId) => {
        setLoading(true);
        fetch(`${localurl}student_main_exam_report/${schoolId}/${sessionId}/${studentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReportData(data.data || []);
                    calculateStats(data.data || []);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const calculateStats = (data) => {
        if (!data || data.length === 0) return;
        const total = data.length;
        let totalMarksObtained = 0;
        let totalMaxMarks = 0;
        let pass = 0;

        data.forEach(item => {
            const written = parseFloat(item.student_marks || 0);
            const viva = parseFloat(item.student_viva || 0);
            const practical = parseFloat(item.student_practical || 0);

            const maxWritten = parseFloat(item.marks || 0);
            const maxViva = parseFloat(item.viva || 0);
            const maxPractical = parseFloat(item.practical || 0);

            const totalObtained = written + viva + practical;
            const totalMax = maxWritten + maxViva + maxPractical;

            totalMarksObtained += totalObtained;
            totalMaxMarks += totalMax;

            if (totalMax > 0 && (totalObtained / totalMax) >= 0.33) pass++;
        });

        setStats({
            totalExams: total,
            averageMarks: totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : 0,
            passCount: pass
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const studentName = JSON.parse(localStorage.getItem("authData"))?.studentName || "Student";
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");

    const getBase64ImageFromUrl = async (url) => {
        if (!url) return null;
        try {
            if (url.startsWith('data:')) return url;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Fetch failed");
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("Logo fetch failed", e);
            return null;
        }
    };

    const exportPDF = async () => {
        try {
            const doc = new jsPDF();
            const school = schoolInfo || JSON.parse(localStorage.getItem("school") || "{}");

            const tableColumn = ["Subject", "Date", "Written", "Viva", "Prac.", "Total", "Status"];
            const tableRows = (reportData || []).map((item) => {
                const written = parseFloat(item.student_marks || 0);
                const viva = parseFloat(item.student_viva || 0);
                const practical = parseFloat(item.student_practical || 0);
                const totalObtained = written + viva + practical;
                const totalMax = parseFloat(item.marks || 0) + parseFloat(item.viva || 0) + parseFloat(item.practical || 0);
                const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                
                return [
                    item.subject_name,
                    formatDate(item.exam_date),
                    written,
                    viva,
                    practical,
                    `${totalObtained} / ${totalMax}`,
                    percentage >= 33 ? "PASS" : "FAIL"
                ];
            });

            const drawHeader = async (doc) => {
                const pageWidth = doc.internal.pageSize.width;
                let currentY = 15;

                const logoUrl = school?.upload_logo;
                if (logoUrl) {
                    const base64Logo = await getBase64ImageFromUrl(logoUrl);
                    if (base64Logo) {
                        try {
                            const img = new Image();
                            img.src = base64Logo;
                            await new Promise(r => img.onload = r);
                            const logoHeight = 18;
                            const ratio = img.width / img.height;
                            const logoWidth = logoHeight * ratio;
                            doc.addImage(base64Logo, "PNG", (pageWidth - logoWidth) / 2, currentY, logoWidth, logoHeight);
                            currentY += logoHeight + 4;
                        } catch (e) {}
                    }
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(20);
                doc.setTextColor(15, 23, 42);
                const schoolName = school?.school_name?.toUpperCase() || "SCHOOL NAME";
                doc.text(schoolName, pageWidth / 2, currentY + 5, { align: "center" });

                currentY += 12;
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(100, 116, 139);
                doc.text(school?.address || "", pageWidth / 2, currentY, { align: "center" });
                currentY += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text(`Contact: ${school?.mobile_no || "-"} | Reg No: ${school?.registration_no || "-"}`, pageWidth / 2, currentY, { align: "center" });

                currentY += 8;
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.5);
                doc.line(20, currentY, pageWidth - 20, currentY);
                currentY += 10;
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(15, 23, 42);
                doc.text("EXAMINATION PERFORMANCE REPORT", pageWidth / 2, currentY, { align: "center" });

                currentY += 12;
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text(`Student Name:`, 20, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(`${studentName}`, 45, currentY);
                
                doc.setFont("helvetica", "bold");
                doc.text(`Result Date:`, pageWidth - 80, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(`${new Date().toLocaleDateString("en-GB")}`, pageWidth - 60, currentY);

                currentY += 10;
                doc.setFillColor(248, 250, 252);
                doc.rect(20, currentY, pageWidth - 40, 10, "F");
                doc.setDrawColor(241, 245, 249);
                doc.rect(20, currentY, pageWidth - 40, 10, "S");
                doc.setFont("helvetica", "bold");
                doc.setTextColor(51, 65, 85);
                doc.text(`Total Exams: ${stats.totalExams}`, 25, currentY + 6.5);
                doc.text(`Aggregate: ${stats.averageMarks}%`, pageWidth / 2, currentY + 6.5, { align: "center" });
                doc.text(`Status: ${stats.passCount}/${stats.totalExams} Passed`, pageWidth - 25, currentY + 6.5, { align: "right" });

                return currentY + 18;
            };

            const startY = await drawHeader(doc);
            doc.autoTable({
                startY: startY,
                head: [tableColumn],
                body: tableRows,
                theme: "striped",
                headStyles: { fillColor: [15, 23, 42], textColor: 255, halign: "center", fontSize: 9, fontStyle: "bold", cellPadding: 4 },
                bodyStyles: { halign: "center", fontSize: 8, textColor: [51, 65, 85], cellPadding: 3 },
                margin: { left: 20, right: 20 }
            });

            doc.save(`Exam_Report_${studentName.replace(/\s+/g, '_')}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF");
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium text-sm">Evaluating your performance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans pb-32 md:pb-12 overflow-x-hidden">
            <style>{`
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

            {/* Header section */}
            <div className="mb-8 flex flex-col gap-6 px-1 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-8 bg-indigo-600 rounded-full"></div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Academic Transcript</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">Exam Report</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Performance Intelligence Hub</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <button 
                            onClick={exportPDF}
                            className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-indigo-600 group"
                            title="Export PDF"
                        >
                            <FaFilePdf size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="h-7 w-7 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <FaGraduationCap size={12} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Verified ID</span>
                                <span className="text-xs font-black text-slate-700 tracking-tight">{studentName}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <FaChartLine size={80} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Live Academic Status</p>
                        <h3 className="text-white text-lg font-bold leading-tight max-w-xs">
                            Monitor your grade progression and subject-wise metrics.
                        </h3>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-blue-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                        <FaGraduationCap className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Total Exams</p>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-900 leading-none mt-1">{stats.totalExams}</h3>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-indigo-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
                        <FaChartLine className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Aggregate</p>
                        <h3 className="text-lg md:text-2xl font-bold text-indigo-600 leading-none mt-1">{stats.averageMarks}%</h3>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-emerald-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 shrink-0">
                        <FaCheckCircle className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Passed</p>
                        <h3 className="text-lg md:text-2xl font-bold text-emerald-600 leading-none mt-1">{stats.passCount}</h3>
                    </div>
                </div>
            </div>

            {/* Table/Card Container */}
            <div className="mb-8">
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50">
                        <h2 className="text-xl font-bold ">Examination Results</h2>
                    </div>
                    <table className="w-full text-left border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-6 py-4 whitespace-nowrap text-sm font-bold uppercase tracking-wider border border-gray-300">Exam Detail</th>
                                <th className="px-6 py-4 whitespace-nowrap text-sm font-bold uppercase tracking-wider border border-gray-300">Subject</th>
                                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Marks Breakup</th>
                                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Grand Total</th>
                                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? (
                                reportData.map((item, index) => {
                                    const written = parseFloat(item.student_marks || 0);
                                    const viva = parseFloat(item.student_viva || 0);
                                    const practical = parseFloat(item.student_practical || 0);

                                    const maxWritten = parseFloat(item.marks || 0);
                                    const maxViva = parseFloat(item.viva || 0);
                                    const maxPractical = parseFloat(item.practical || 0);

                                    const totalObtained = written + viva + practical;
                                    const totalMax = maxWritten + maxViva + maxPractical;
                                    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                                    const isPass = percentage >= 33;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 border border-gray-200">
                                                <div className="text-gray-900 text-sm tracking-tight">{item.exam_name}</div>
                                                <div className="text-xs font-bold text-gray-500 mt-0.5 uppercase tracking-widest">
                                                    {formatDate(item.exam_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border border-gray-200">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {item.subject_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center border border-gray-200">
                                                <div className="flex justify-center items-center gap-2">
                                                    <div className="flex flex-col items-center min-w-[32px]">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">W</span>
                                                        <span className="text-xs text-gray-900">{written}</span>
                                                    </div>
                                                    <div className="h-4 w-px bg-gray-200"></div>
                                                    <div className="flex flex-col items-center min-w-[32px]">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">V</span>
                                                        <span className="text-xs text-indigo-700">{viva}</span>
                                                    </div>
                                                    <div className="h-4 w-px bg-gray-200"></div>
                                                    <div className="flex flex-col items-center min-w-[32px]">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">P</span>
                                                        <span className="text-xs text-emerald-700">{practical}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border border-gray-200">
                                                <div className="text-sm text-gray-900">
                                                    {totalObtained} <span className="text-gray-400 font-bold">/ {totalMax}</span>
                                                </div>
                                                <div className="w-20 mx-auto bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border border-gray-200">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${isPass
                                                    ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                                                    : "text-rose-700 bg-rose-50 border border-rose-100"
                                                    }`}>
                                                    {isPass ? "Pass" : "Fail"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                        No exam records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    {reportData.length > 0 ? (
                        reportData.map((item, index) => {
                            const written = parseFloat(item.student_marks || 0);
                            const viva = parseFloat(item.student_viva || 0);
                            const practical = parseFloat(item.student_practical || 0);

                            const maxWritten = parseFloat(item.marks || 0);
                            const maxViva = parseFloat(item.viva || 0);
                            const maxPractical = parseFloat(item.practical || 0);

                            const totalObtained = written + viva + practical;
                            const totalMax = maxWritten + maxViva + maxPractical;
                            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                            const isPass = percentage >= 33;

                            return (
                                <div key={index} className={`bg-white p-5 rounded-3xl shadow-sm border-l-4 transition-all ${isPass ? "border-l-emerald-500" : "border-l-rose-500"} border-t border-r border-b border-gray-100`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                                                {item.subject_name}
                                            </span>
                                            <h4 className="font-bold text-gray-900 text-base leading-tight">{item.exam_name}</h4>
                                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                                                {formatDate(item.exam_date)}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${isPass
                                            ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                                            : "text-rose-700 bg-rose-50 border border-rose-100"
                                            }`}>
                                            {isPass ? "Pass" : "Fail"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Written</p>
                                            <p className="text-sm font-bold text-gray-900">{written}</p>
                                        </div>
                                        <div className="text-center border-x border-gray-200">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Viva</p>
                                            <p className="text-sm font-bold text-indigo-600">{viva}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Prac.</p>
                                            <p className="text-sm font-bold text-emerald-600">{practical}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500 font-medium">Grand Total</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {totalObtained} <span className="text-gray-400 font-medium">/ {totalMax}</span>
                                            </p>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                            No records found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleStudentMainExamReport;
