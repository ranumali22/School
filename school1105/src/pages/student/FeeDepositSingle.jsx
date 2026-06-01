import React, { useState, useEffect } from "react";
import CommonPagination from "../../Component/common/Pagination";
import { FaFilePdf, FaFileExcel, FaRupeeSign } from "react-icons/fa";
import { localurl } from "../../api/api";
import { showError } from "../../Component/common/alert";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FeeReceipt from "../../Component/ui/FeeReceipt";

const FeeDepositSingle = () => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const student_id = localStorage.getItem("student_id") || authData.id;
    const session_id = localStorage.getItem("session_id");
    const school_id = localStorage.getItem("school_id");
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExport, setShowExport] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [activeTab, setActiveTab] = useState("history");
    const studentName = authData.studentName || "Student";

    useEffect(() => {
        if (!school_id) return;
        fetch(`${localurl}all_school`)
            .then(res => res.json())
            .then(data => {
                if (data && data.row && data.row.length > 0) {
                    const currentSchool = data.row.find(s => String(s.id) === String(school_id));
                    setSchoolInfo(currentSchool);
                }
            })
            .catch(console.error);
    }, [school_id]);

    useEffect(() => {
        if (!student_id || !school_id || !session_id) return;

        setLoading(true);
        fetch(`${localurl}student_fee_report/${school_id}/${session_id}/${student_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFeeData(data.data);
                } else {
                    showError(data.message || "Failed to fetch fee data");
                }
            })
            .catch(err => {
                console.error(err);
                showError("Connection error");
            })
            .finally(() => setLoading(false));
    }, [school_id, session_id, student_id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium text-sm">Loading fee records...</p>
                </div>
            </div>
        );
    }

    if (!feeData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-rose-50 p-6 rounded-full mb-4">
                    <FaRupeeSign className="text-4xl text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Fee Data</h3>
                <p className="text-gray-500 mt-2">We couldn't find any fee records for your account.</p>
            </div>
        );
    }

    const { totalAllot, totalPaid, balance, payments, heads, allotments, breakdown, student } = feeData;

    // Map student keys for FeeReceipt compatibility
    const mappedStudent = student ? {
        ...student,
        students_name: student.studentName || student.students_name,
        father_name: student.fatherName || student.father_name,
        class: student.class_name || student.class || "-",
        session: student.session_name || student.session || "-"
    } : {};

    // Pagination for payments
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = (payments || []).slice(indexOfFirstItem, indexOfLastItem);

    const getHeadName = (id) => {
        if (!heads) return `Head ${id}`;
        const head = heads.find(h => String(h.id) === String(id));
        return head ? (head.feehead || head.fee_head_name || head.name || `Head ${id}`) : `Head ${id}`;
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getBase64ImageFromUrl = async (url) => {
        if (!url) return null;
        try {
            if (url.startsWith('data:')) return url;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error("Fetch failed");
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("Logo fetch failed or timed out", e);
            return null;
        }
    };

    const exportPDF = async () => {
        try {
            const doc = new jsPDF();
            const school = schoolInfo || JSON.parse(localStorage.getItem("school") || "{}");

            const tableColumn = ["Sr No.", "Receipt No.", "Date", "Fee Head", "Amount"];
            const tableRows = (payments || []).map((p, i) => [
                i + 1,
                p.receiptNo || "-",
                formatDateDisplay(p.pay_date || p.payment_date),
                getHeadName(p.feehead_id || p.fee_head_id),
                `INR ${p.fee_pay}`
            ]);

            const drawHeader = async (doc) => {
                const pageWidth = doc.internal.pageSize.width;
                let currentY = 15;

                // --- 1. Logo (Centered on top) ---
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
                        } catch (e) {
                            console.error("Logo add failed", e);
                        }
                    }
                }

                // --- 2. School Name ---
                doc.setFont("helvetica", "bold");
                doc.setFontSize(20);
                doc.setTextColor(15, 23, 42); // slate-900
                const schoolName = school?.school_name?.toUpperCase() || "SCHOOL NAME";
                doc.text(schoolName, pageWidth / 2, currentY + 5, { align: "center" });

                // --- 3. Address & Contact ---
                currentY += 12;
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(100, 116, 139); // slate-500
                doc.text(school?.address || "", pageWidth / 2, currentY, { align: "center" });

                currentY += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                const contactText = `Contact: ${school?.mobile_no || school?.phone || "-"} | Reg No: ${school?.registration_no || "-"}`;
                doc.text(contactText, pageWidth / 2, currentY, { align: "center" });

                // --- 4. Divider & Title ---
                currentY += 8;
                doc.setDrawColor(226, 232, 240); // slate-200
                doc.setLineWidth(0.5);
                doc.line(20, currentY, pageWidth - 20, currentY);

                currentY += 10;
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(15, 23, 42);
                doc.text("STUDENT FEE DEPOSIT REPORT", pageWidth / 2, currentY, { align: "center" });

                // --- 5. Student Info Section ---
                currentY += 12;
                doc.setFontSize(9);
                
                // Info Row 1
                doc.setFont("helvetica", "bold");
                doc.text(`Student Name:`, 20, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(`${studentName}`, 45, currentY);

                doc.setFont("helvetica", "bold");
                doc.text(`Session:`, pageWidth - 80, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(`${mappedStudent.session || "-"}`, pageWidth - 60, currentY);

                // Info Row 2
                currentY += 6;
                doc.setFont("helvetica", "bold");
                doc.text(`Class:`, 20, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(`${mappedStudent.class || "-"}`, 45, currentY);

                doc.setFont("helvetica", "bold");
                doc.text(`Date:`, pageWidth - 80, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(`${new Date().toLocaleDateString("en-GB")}`, pageWidth - 60, currentY);

                // --- 6. Summary Stats Box ---
                currentY += 12;
                doc.setFillColor(248, 250, 252); // slate-50
                doc.rect(20, currentY, pageWidth - 40, 10, "F");
                doc.setDrawColor(241, 245, 249); // slate-100
                doc.rect(20, currentY, pageWidth - 40, 10, "S");
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8.5);
                doc.setTextColor(51, 65, 85); // slate-700
                doc.text(`Total Allotted: INR ${totalAllot}`, 25, currentY + 6.5);
                doc.text(`Total Paid: INR ${totalPaid}`, pageWidth / 2, currentY + 6.5, { align: "center" });
                doc.text(`Balance Due: INR ${balance}`, pageWidth - 25, currentY + 6.5, { align: "right" });

                return currentY + 18;
            };

            const startY = await drawHeader(doc);

            doc.autoTable({
                startY: startY,
                head: [tableColumn],
                body: tableRows,
                theme: "striped",
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: 255,
                    halign: "center",
                    fontSize: 9,
                    fontStyle: "bold",
                    cellPadding: 4
                },
                bodyStyles: {
                    halign: "center",
                    fontSize: 8,
                    textColor: [51, 65, 85],
                    cellPadding: 3
                },
                margin: { left: 20, right: 20 },
            });

            doc.save(`Fee_Report_${studentName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };




    const exportExcel = () => {
        const data = (payments || []).map((p, i) => ({
            "Sr No.": i + 1,
            "Receipt No.": p.receiptNo || "-",
            "Date": formatDateDisplay(p.pay_date || p.payment_date),
            "Fee Head": getHeadName(p.fee_head_id),
            "Amount": p.fee_pay
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Deposits");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `Fee_Report_${studentName}.xlsx`);
    };

    return (
        <section className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans pb-32 md:pb-12 overflow-x-hidden">
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

            {/* 🔷 MODERN APP HEADER */}
            <div className="mb-8 flex flex-col gap-6 px-1 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-8 bg-blue-600 rounded-full"></div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Official Statement</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">Fee Ledger</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Financial Intelligence Terminal</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="h-7 w-7 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                <FaRupeeSign size={12} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Verified Identity</span>
                                <span className="text-xs font-black text-slate-700 tracking-tight">{studentName}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <FaRupeeSign size={80} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Ledger Summary</p>
                        <h3 className="text-white text-lg font-bold leading-tight max-w-xs">
                            Review your complete fee history and outstanding liabilities.
                        </h3>
                    </div>
                </div>
            </div>

            {/* 📊 SUMMARY GRID (2x2 FOR MOBILE) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 px-1">
                {/* 📈 Fee Clearance Progress */}
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-3">
                    <div className="relative h-14 w-14 shrink-0">
                        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-50" strokeWidth="4" />
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-600" strokeWidth="4" strokeDasharray={`${Math.round((totalPaid / totalAllot) * 100) || 0}, 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-900">{Math.round((totalPaid / totalAllot) * 100) || 0}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Progress</p>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${balance <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {balance <= 0 ? 'Paid' : 'Pending'}
                        </span>
                    </div>
                </div>

                {/* Total Allotted */}
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                        <FaRupeeSign size={14} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Allotted</p>
                        <h3 className="text-sm font-black text-slate-900">₹{totalAllot}</h3>
                    </div>
                </div>

                {/* Total Paid */}
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                        <FaRupeeSign size={14} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid</p>
                        <h3 className="text-sm font-black text-emerald-600">₹{totalPaid}</h3>
                    </div>
                </div>

                {/* Balance Due */}
                <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100 shrink-0">
                        <FaRupeeSign size={14} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Due</p>
                        <h3 className="text-sm font-black text-rose-600">₹{balance}</h3>
                    </div>
                </div>
            </div>

            {/* 📱 NATIVE APP TABS */}
            <div className="mb-8">
                <div className="bg-slate-100/50 p-1 rounded-2xl flex mb-6 border border-slate-100">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('breakdown')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'breakdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Breakdown
                    </button>
                </div>

                {activeTab === 'history' ? (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Transactions</h3>
                            <button
                                onClick={() => setShowExport(!showExport)}
                                className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                                <FaFilePdf size={16} />
                            </button>
                            {showExport && (
                                <div className="absolute right-6 mt-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                    <button onClick={() => { exportPDF(); setShowExport(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 w-full text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        <FaFilePdf className="text-rose-500" /> PDF Report
                                    </button>
                                    <button onClick={() => { exportExcel(); setShowExport(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 w-full text-left text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        <FaFileExcel className="text-emerald-500" /> Excel Sheet
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt No</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Head</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentPayments.map((p, i) => (
                                        <tr key={p.id || i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-slate-900 text-sm font-bold">{p.receiptNo || "N/A"}</td>
                                            <td className="px-6 py-4 text-center text-slate-600 text-sm">{formatDateDisplay(p.pay_date || p.payment_date)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-600 uppercase tracking-widest">
                                                    {getHeadName(p.feehead_id || p.fee_head_id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-900 font-black">₹{p.fee_pay}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => setSelectedReceipt(p)} className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View List */}
                        <div className="md:hidden divide-y divide-slate-50">
                            {currentPayments.length > 0 ? (
                                currentPayments.map((p, i) => (
                                    <div key={p.id || i} className="p-6 flex flex-col gap-4 active:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{p.receiptNo || "N/A"}</span>
                                                <h4 className="font-black text-slate-900 text-sm">{getHeadName(p.feehead_id || p.fee_head_id)}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-emerald-600 leading-none">₹{p.fee_pay}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{formatDateDisplay(p.pay_date || p.payment_date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded-md">Paid Online</span>
                                            <button onClick={() => setSelectedReceipt(p)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest underline decoration-blue-200 decoration-2 underline-offset-4">Get Receipt</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaRupeeSign className="text-slate-200 text-2xl" />
                                    </div>
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Transactions Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(breakdown || []).map((item, i) => {
                            const isPaid = item.balance <= 0;
                            return (
                                <div key={i} className={`bg-white rounded-[2.5rem] p-6 border transition-all duration-300 hover:shadow-xl ${isPaid ? "border-emerald-100 shadow-emerald-50/20" : "border-slate-100 shadow-slate-50/20"}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-black text-slate-900 text-base leading-tight">{item.headName}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fee Component</p>
                                        </div>
                                        {isPaid ? (
                                            <div className="h-8 w-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                                <FaRupeeSign size={12} />
                                            </div>
                                        ) : (
                                            <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Pending</span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                                            <span>Allotted</span>
                                            <span className="text-slate-900 font-black">₹{item.allotted}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50/50">
                                            <span className="text-emerald-600">Paid Amount</span>
                                            <span className="text-emerald-600 font-black">₹{item.paid}</span>
                                        </div>
                                        <div className="pt-2 flex justify-between items-center border-t border-slate-50">
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Balance</span>
                                            <span className={`text-xl font-black tracking-tighter ${item.balance > 0 ? "text-rose-600" : "text-slate-200"}`}>₹{item.balance}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'history' && (payments || []).length > 0 && (
                    <div className="mt-8">
                        <CommonPagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(payments.length / itemsPerPage)}
                            onPageChange={setCurrentPage}
                            totalItems={payments.length}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                        />
                    </div>
                )}
            </div>

            {selectedReceipt && (
                <FeeReceipt
                    student={mappedStudent}
                    deposit={selectedReceipt}
                    close={() => setSelectedReceipt(null)}
                />
            )}
        </section>
    );
};

export default FeeDepositSingle;
