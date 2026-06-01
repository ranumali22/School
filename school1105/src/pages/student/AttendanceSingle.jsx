import React, { useState, useEffect } from "react";
import CommonPagination from "../../Component/common/Pagination";
import { FaCalendarAlt, FaChartLine, FaFileExcel, FaFilePdf, FaGraduationCap, FaSearch } from "react-icons/fa";
import { localurl } from "../../api/api";
import { showError } from "../../Component/common/alert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FloatingInputs } from "../../Component/common/FloatingInput";

const AttendanceSingle = () => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const student_id = localStorage.getItem("student_id") || authData.id;
    const session_id = localStorage.getItem("session_id");
    const school_id = localStorage.getItem("school_id");
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(lastDay);
    const [attendanceData, setAttendanceData] = useState([]);
    const [showExport, setShowExport] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [fromFocused, setFromFocused] = useState(false);
    const [toFocused, setToFocused] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const studentName = authData.studentName || "Student";

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "-";
        const parts = dateStr.split("T")[0].split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

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

    useEffect(() => {
        if (!student_id || !school_id || !session_id) return;

        fetch(`${localurl}student_attendance_report/${school_id}/${session_id}/${student_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setAttendanceData(data.data);
                    console.log("attendance data", data.data);

                } else {
                    setAttendanceData([]);
                }
            })
            .catch(err => {
                console.error(err);
                showError("Failed to fetch attendance data");
            });
    }, [school_id, session_id, student_id]);


    const filteredData = attendanceData.filter(item => {
        let match = true;
        const itemDateStr = item.attendance_date ? item.attendance_date.split("T")[0] : null;
        if (!itemDateStr) return false;

        if (fromDate) {
            match = match && itemDateStr >= fromDate;
        }
        if (toDate) {
            match = match && itemDateStr <= toDate;
        }
        return match;
    });


    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const getStatus = (s) => {
        if (s.in_status === "1" || s.in_status === 1 || s.attendance_status === "Present") return "Present";
        return "Absent";
    };


    const exportPDF = async () => {
        try {
            console.log("Starting Professional PDF Export...");
            const doc = new jsPDF();
            const school = schoolInfo || JSON.parse(localStorage.getItem("school") || "{}");

            if (!filteredData || filteredData.length === 0) {
                showError("No data available to export");
                return;
            }

            // --- 1. CONFIG & HELPERS ---
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            const colors = {
                primary: [15, 23, 42],     // Deep Navy (Slate 900)
                accent: [79, 70, 229],      // Indigo 600
                secondary: [100, 116, 139], // Slate 500
                light: [248, 250, 252],     // Slate 50
                border: [226, 232, 240],    // Slate 200
                success: [16, 185, 129],    // Emerald 500
                danger: [239, 68, 68]       // Rose 500
            };

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
                        // Fallback using fetch if img tag fails due to CORS or other issues
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

            // Fix Logo URL - Try multiple paths if needed
            let logoUrl = school?.upload_logo;
            let logoData = null;

            if (logoUrl) {
                const serverBase = (import.meta.env.VITE_SERVER_URL || "http://localhost:8000").replace(/\/$/, "");
                const possibleUrls = [
                    logoUrl.startsWith('http') ? logoUrl : `${serverBase}/uploads/${logoUrl}`,
                    logoUrl.startsWith('http') ? logoUrl : `${serverBase}/${logoUrl}`,
                    `${window.location.origin}/uploads/${logoUrl}`
                ];

                for (const url of possibleUrls) {
                    try {
                        console.log("Trying logo URL:", url);
                        logoData = await getBase64Image(url);
                        if (logoData) {
                            console.log("Logo loaded successfully!");
                            break;
                        }
                    } catch (e) {
                        console.warn(`Failed to load logo from ${url}`);
                    }
                }
            }

            // --- 2. DATA PREP ---
            const totalDays = filteredData.length;
            const presentDays = filteredData.filter(s => getStatus(s) === "Present").length;
            const absentDays = totalDays - presentDays;
            const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

            const tableColumn = ["#", "Student ID", "Name", "Date", "Status", "In", "Out"];
            const tableRows = filteredData.map((s, i) => [
                { content: i + 1, styles: { halign: 'center' } },
                s.student_ids || student_id,
                s.studentName || studentName,
                formatDateDisplay(s.attendance_date),
                { 
                    content: getStatus(s), 
                    styles: { 
                        textColor: getStatus(s) === "Present" ? colors.success : colors.danger,
                        fontStyle: 'bold'
                    } 
                },
                s.in_time || "--",
                s.out_time || "--",
            ]);

            // --- 3. DRAWING FUNCTIONS ---

            const drawHeader = (doc) => {
                const sName = (school?.school_name || school?.schoolName || school?.name || "SCHOOL NAME").toUpperCase();
                const logoSize = 22;
                const topY = 10;
                const gap = 4; // Tight gap between logo and text

                if (logoData) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(17);
                    const nameWidth = doc.getTextWidth(sName);
                    const totalHeaderWidth = logoSize + gap + nameWidth;
                    const startX = (pageWidth - totalHeaderWidth) / 2;

                    // Logo
                    doc.addImage(logoData, "PNG", startX, topY, logoSize, logoSize);

                    // School Name
                    const textX = startX + logoSize + gap;
                    doc.setTextColor(...colors.primary);
                    doc.text(sName, textX, topY + 10);
                    
                    // Address & Contact - Centered under the name
                    const nameCenter = textX + (nameWidth / 2);
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8.5);
                    doc.setTextColor(...colors.secondary);
                    const addr = (school?.address || "").toUpperCase();
                    doc.text(addr, nameCenter, topY + 16, { align: "center" });
                    
                    doc.setFontSize(7.5);
                    doc.text(`Contact: ${school?.mobile_no || "-"} | Email: ${school?.email || "-"}`, nameCenter, topY + 20, { align: "center" });
                } else {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(19);
                    doc.setTextColor(...colors.primary);
                    doc.text(sName, pageWidth / 2, topY + 10, { align: "center" });
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9.5);
                    doc.setTextColor(...colors.secondary);
                    const addr = (school?.address || "").toUpperCase();
                    doc.text(addr, pageWidth / 2, topY + 17, { align: "center" });
                    
                    doc.setFontSize(8.5);
                    doc.text(`Contact: ${school?.mobile_no || "-"} | Email: ${school?.email || "-"}`, pageWidth / 2, topY + 23, { align: "center" });
                }

                // Decorative Line
                doc.setDrawColor(...colors.border);
                doc.setLineWidth(0.5);
                doc.line(margin, topY + 27, pageWidth - margin, topY + 27);

                // Report Title - Smaller and moved up
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...colors.accent);
                doc.text("ATTENDANCE PROGRESS REPORT", pageWidth / 2, topY + 36, { align: "center" });
            };

            const drawStudentProfile = (doc, y) => {
                doc.setFillColor(...colors.light);
                doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F');
                
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...colors.secondary);
                
                // Labels
                doc.text("STUDENT NAME:", margin + 5, y + 8);
                doc.text("STUDENT ID:", margin + 5, y + 16);
                doc.text("CLASS / SEC:", margin + contentWidth / 2 + 5, y + 8);
                doc.text("SESSION:", margin + contentWidth / 2 + 5, y + 16);

                // Values
                doc.setTextColor(...colors.primary);
                doc.setFont("helvetica", "bold");
                doc.text(studentName.toUpperCase(), margin + 35, y + 8);
                doc.text(String(student_id), margin + 35, y + 16);
                doc.text(authData.class_name || "-", margin + contentWidth / 2 + 35, y + 8);
                doc.text(authData.session_name || "-", margin + contentWidth / 2 + 35, y + 16);
            };

            const drawSummaryBoxes = (doc, y) => {
                const boxWidth = (contentWidth - 15) / 4;
                const boxHeight = 20;

                const boxes = [
                    { label: "TOTAL DAYS", val: totalDays, color: colors.primary },
                    { label: "PRESENT", val: presentDays, color: colors.success },
                    { label: "ABSENT", val: absentDays, color: colors.danger },
                    { label: "PERCENTAGE", val: `${attendancePercentage}%`, color: colors.accent }
                ];

                boxes.forEach((box, i) => {
                    const bx = margin + (i * (boxWidth + 5));
                    doc.setDrawColor(...colors.border);
                    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, 'S');
                    
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(...colors.secondary);
                    doc.text(box.label, bx + boxWidth/2, y + 6, { align: 'center' });
                    
                    doc.setFontSize(12);
                    doc.setTextColor(...box.color);
                    doc.text(String(box.val), bx + boxWidth/2, y + 14, { align: 'center' });
                });
            };


            // Initial Page Setup
            drawHeader(doc);

            // --- 4. TABLE ---
            autoTable(doc, {
                startY: 52, // Reduced space between title and table
                head: [tableColumn],
                body: tableRows,
                theme: "grid",
                headStyles: {
                    fillColor: colors.primary,
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold',
                    cellPadding: 4,
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: 3,
                    textColor: [30, 41, 59]
                },
                columnStyles: {
                    0: { cellWidth: 10 },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                    6: { halign: 'center' }
                },
                alternateRowStyles: {
                    fillColor: [252, 253, 255]
                },
                didDrawPage: (data) => {
                    if (data.pageNumber > 1) {
                        drawHeader(doc);
                    }
                    
                    // Footer
                    doc.setFontSize(8);
                    doc.setTextColor(...colors.secondary);
                    doc.text(`Official Attendance Report | ${studentName} | Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                },
                margin: { left: margin, right: margin, bottom: 30 }
            });

            // --- 5. SIGNATURE AREA ---
            const finalY = doc.lastAutoTable.finalY + 20;
            if (finalY < pageHeight - 40) {
                doc.setDrawColor(...colors.border);
                doc.line(pageWidth - 65, finalY + 15, pageWidth - margin, finalY + 15);
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...colors.primary);
                doc.text("Authorized Signatory", pageWidth - 40, finalY + 22, { align: 'center' });
                doc.setFontSize(7);
                doc.setTextColor(...colors.secondary);
                doc.text("Computer Generated Report", pageWidth - 40, finalY + 26, { align: 'center' });
            }

            const fileName = `Attendance_Report_${studentName.replace(/\s+/g, '_')}.pdf`;
            doc.save(fileName);
            console.log("Professional PDF Export Complete");
        } catch (error) {
            console.error("PDF Export Failed:", error);
            showError("Failed to generate professional report");
        }
    };


    const exportExcel = () => {
        try {
            console.log("Starting Excel Export...");
            if (!filteredData || filteredData.length === 0) {
                showError("No data available to export");
                return;
            }

            const data = filteredData.map((s, i) => ({
                "#": i + 1,
                "Student ID": s.student_ids || student_id,
                Name: s.studentName || studentName,
                Date: formatDateDisplay(s.attendance_date),
                Status: getStatus(s),
                In: s.in_time || "--",
                Out: s.out_time || "--"
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const fileData = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const safeStudentName = studentName ? studentName.replace(/[^a-z0-9]/gi, '_') : "Student";
            const fileName = `Attendance_${safeStudentName}.xlsx`;

            console.log("Saving Excel as:", fileName);
            saveAs(fileData, fileName);
            console.log("Excel Export Complete");
        } catch (error) {
            console.error("Excel Export Failed:", error);
            showError("Failed to generate Excel report");
        }
    };

    const totalDays = filteredData.length;
    const presentDays = filteredData.filter(s => getStatus(s) === "Present").length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

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
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold ">Attendance Report</h2>
                    <p className="text-gray-500 text-sm mt-1">View and manage your attendance history.</p>
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] w-full md:w-auto">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Student</p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <p className="text-sm font-bold text-gray-900">{studentName}</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-blue-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                        <FaCalendarAlt className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Total Days</p>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-900 leading-none mt-1">{totalDays}</h3>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-emerald-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 shrink-0">
                        <FaGraduationCap className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Present</p>
                        <h3 className="text-lg md:text-2xl font-bold text-emerald-600 leading-none mt-1">{presentDays}</h3>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-rose-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100 shrink-0">
                        <FaFilePdf className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Absent</p>
                        <h3 className="text-lg md:text-2xl font-bold text-rose-600 leading-none mt-1">{absentDays}</h3>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5 hover:shadow-md transition-all">
                    <div className="bg-indigo-600 h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
                        <FaChartLine className="text-lg md:text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] md:text-sm font-semibold text-gray-500 uppercase tracking-tight md:tracking-wider">Efficiency</p>
                        <h3 className="text-lg md:text-2xl font-bold text-indigo-600 leading-none mt-1">{attendancePercentage}%</h3>
                    </div>
                </div>
            </div>

            {/* Filters Container */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-50 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex-1 md:w-48">
                            <FloatingInputs
                                label="From Date"
                                type={fromFocused ? "date" : "text"}
                                onFocus={() => setFromFocused(true)}
                                onBlur={() => setFromFocused(false)}
                                value={fromFocused ? fromDate : formatDateDisplay(fromDate)}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <span className="text-gray-400 font-black text-xs uppercase tracking-widest">to</span>

                        <div className="flex-1 md:w-48">
                            <FloatingInputs
                                label="To Date"
                                type={toFocused ? "date" : "text"}
                                onFocus={() => setToFocused(true)}
                                onBlur={() => setToFocused(false)}
                                value={toFocused ? toDate : formatDateDisplay(toDate)}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <button
                            onClick={() => setShowExport(!showExport)}
                            className="bg-indigo-600 text-white w-full md:w-auto px-8 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all duration-300 font-bold text-sm"
                        >
                            Export Records
                        </button>

                        {showExport && (
                            <div className="absolute right-0 md:left-0 mt-2 w-full md:w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                <button
                                    onClick={async () => {
                                        await exportPDF();
                                        setShowExport(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm font-semibold text-gray-700 transition-colors"
                                >
                                    <FaFilePdf className="text-red-500" />
                                    Save as PDF
                                </button>

                                <button
                                    onClick={() => {
                                        exportExcel();
                                        setShowExport(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm font-semibold text-gray-700 transition-colors"
                                >
                                    <FaFileExcel className="text-green-600" />
                                    Save as Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table/Card Container */}
            <div className="mb-8">
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-6 py-4 whitespace-nowrap text-sm font-bold uppercase tracking-wider border border-gray-300">#</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Date</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Status</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Check In</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold uppercase tracking-wider border border-gray-300">Check Out</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((s, i) => (
                                <tr key={s.id || i} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs border border-gray-200">{indexOfFirstItem + i + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-sm text-center border border-gray-200">{formatDateDisplay(s.attendance_date)}</td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center border border-gray-200">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getStatus(s) === "Present"
                                                ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                                                : "text-rose-700 bg-rose-50 border border-rose-100"
                                                }`}>
                                                {getStatus(s)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 text-sm border border-gray-200">{s.in_time || "--"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 text-sm border border-gray-200">{s.out_time || "--"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                        No attendance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    {currentItems.length > 0 ? (
                        currentItems.map((s, i) => {
                            const isPresent = getStatus(s) === "Present";
                            return (
                                <div key={s.id || i} className={`bg-white p-5 rounded-3xl shadow-sm border-l-4 transition-all ${isPresent ? "border-l-emerald-500" : "border-l-rose-500"} border-t border-r border-b border-gray-100`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-sm border border-gray-100">
                                                {indexOfFirstItem + i + 1}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Attendance Date</p>
                                                <p className="text-base font-bold text-gray-900">{formatDateDisplay(s.attendance_date)}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${isPresent
                                            ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                                            : "text-rose-700 bg-rose-50 border border-rose-100"
                                            }`}>
                                            {getStatus(s)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Check In</p>
                                            <p className="text-sm font-bold text-gray-700 text-center">{s.in_time || "--"}</p>
                                        </div>
                                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Check Out</p>
                                            <p className="text-sm font-bold text-gray-700 text-center">{s.out_time || "--"}</p>
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

            {/* Pagination Container */}
            {filteredData.length > 0 && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <CommonPagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                        onPageChange={setCurrentPage}
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default AttendanceSingle;
