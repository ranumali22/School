import React, { useState, useEffect } from "react";
import CommonPagination from "../../Component/common/Pagination";
import { FaSearch, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { localurl } from "../../api/api";
import { showError } from "../../Component/common/alert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FloatingInputs, FloatingSelect, ClassSelect } from "../../Component/common/FloatingInput";
const AttendanceSingleReports = () => {
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [search, setSearch] = useState("");
    const session_id = localStorage.getItem("session_id");
    const school_id = localStorage.getItem("school_id");
    const today = new Date().toISOString().split("T")[0];
    const [showExport, setShowExport] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [sectionList, setSectionList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const getMonth = (date) => date?.slice(0, 7);

    const monthlyData = selectedStudent?.attendance?.filter((a) =>
        selectedDate
            ? getMonth(a.date) === getMonth(selectedDate)
            : true
    );
    const [form, setForm] = useState({
        class_id: "",
        attendance_type: "All",
        date: today,
    });

    const handleAttendance = (class_id, date, type) => {

        if (!class_id) return;

        setSelectedClassId(class_id);

        fetch(
            localurl +
            "student_attendance/" +
            school_id +
            "/" +
            session_id +
            "/" +
            class_id +
            "/" +
            date +
            "/" +
            type
        )
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSelectedStudents(data.students_data);
                } else {
                    setSelectedStudents([]);
                    showError(data.message);
                }
            });
    };

    const getStatus = (s) => {
        if (s.in_status === "1" || s.in_status === true) return "Present";
        return "Absent";
    };


    useEffect(() => {
        fetch(localurl + "class_section/" + school_id)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setSectionList(data.row);
                }
            });
    }, [school_id]);


    const handleSearch = (value) => {
        const v = value.toLowerCase();

        const found = selectedStudents.find((s) =>
            s.student_name.toLowerCase().includes(v)
        );

        setSelectedStudent(found || null);
    };

    const exportPDF = async () => {
        try {
            const doc = new jsPDF();
            const school = JSON.parse(localStorage.getItem("school") || "{}");

            if (!selectedStudents || selectedStudents.length === 0) {
                showError("No data available to export");
                return;
            }

            // --- 1. CONFIG & HELPERS ---
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            const colors = {
                primary: [15, 23, 42],     // Deep Navy
                accent: [79, 70, 229],      // Indigo
                secondary: [100, 116, 139], // Slate
                light: [248, 250, 252],     // Light Slate
                border: [226, 232, 240],    // Border
                success: [16, 185, 129],    // Emerald
                danger: [239, 68, 68]       // Rose
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

            // Logo Loading with Fallback
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
                        logoData = await getBase64Image(url);
                        if (logoData) break;
                    } catch (e) { console.warn("Logo path failed:", url); }
                }
            }

            // --- 2. DATA PREP ---
            const totalDays = selectedStudents.length;
            const presentDays = selectedStudents.filter(s => getStatus(s) === "Present").length;
            const absentDays = totalDays - presentDays;
            const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

            const tableColumn = ["#", "Name", "Date", "Status", "In", "Out"];
            const tableRows = selectedStudents.map((s, i) => [
                { content: i + 1, styles: { halign: 'center' } },
                s.student_name,
                form.date?.split("-").reverse().join("-"),
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

            // --- 3. DRAWING ---

            const drawHeader = (doc) => {
                const sName = (school?.school_name || "SCHOOL NAME").toUpperCase();
                const logoSize = 28;
                const topY = 10;

                if (logoData) {
                    doc.addImage(logoData, "PNG", margin, topY, logoSize, logoSize);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(22);
                    doc.setTextColor(...colors.primary);
                    doc.text(sName, margin + logoSize + 6, topY + 12);
                    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(...colors.secondary);
                    doc.text((school?.address || "").toUpperCase(), margin + logoSize + 6, topY + 18);
                    doc.text(`Contact: ${school?.phone || school?.mobile_no || "-"} | Email: ${school?.email || "-"}`, margin + logoSize + 6, topY + 23);
                } else {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(24);
                    doc.setTextColor(...colors.primary);
                    doc.text(sName, pageWidth / 2, topY + 12, { align: "center" });
                    doc.text((school?.address || "").toUpperCase(), pageWidth / 2, topY + 18, { align: "center" });
                    doc.text(`Contact: ${school?.phone || school?.mobile_no || "-"} | Email: ${school?.email || "-"}`, pageWidth / 2, topY + 24, { align: "center" });
                }

                doc.setDrawColor(...colors.border);
                doc.setLineWidth(0.5);
                doc.line(margin, 42, pageWidth - margin, 42);

                doc.setFontSize(15);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...colors.accent);
                doc.text("ATTENDANCE REPORT", pageWidth / 2, 54, { align: "center" });
            };

            const drawSummaryBoxes = (doc, y) => {
                const boxWidth = (contentWidth - 15) / 4;
                const boxHeight = 20;
                const boxes = [
                    { label: "TOTAL STUDENTS", val: totalDays, color: colors.primary },
                    { label: "PRESENT", val: presentDays, color: colors.success },
                    { label: "ABSENT", val: absentDays, color: colors.danger },
                    { label: "ATTENDANCE %", val: `${attendancePercentage}%`, color: colors.accent }
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

            drawHeader(doc);

            autoTable(doc, {
                startY: 65,
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
                bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
                columnStyles: { 0: { cellWidth: 10 }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' } },
                alternateRowStyles: { fillColor: [252, 253, 255] },
                didDrawPage: (data) => {
                    if (data.pageNumber > 1) drawHeader(doc);
                    doc.setFontSize(8);
                    doc.setTextColor(...colors.secondary);
                    doc.text(`Official Attendance Report | Page ${data.pageNumber} | Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                },
                margin: { left: margin, right: margin, bottom: 30 }
            });

            // Signature
            const finalY = doc.lastAutoTable.finalY + 20;
            if (finalY < pageHeight - 40) {
                doc.setDrawColor(...colors.border);
                doc.line(pageWidth - 65, finalY + 15, pageWidth - margin, finalY + 15);
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...colors.primary);
                doc.text("Authorized Signatory", pageWidth - 40, finalY + 22, { align: 'center' });
            }

            doc.save(`Attendance_Report_${form.date}.pdf`);
        } catch (error) {
            console.error("PDF Export Failed:", error);
            showError("Failed to generate PDF");
        }
    };

    const exportExcel = () => {
        const data = selectedStudents.map((s, i) => ({
            "#": i + 1,
            Name: s.student_name,
            date: form.date,
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
            type: "application/octet-stream",
        });

        saveAs(fileData, "attendance.xlsx");
    };

    return (
        <section className="bg-white rounded-t-2xl max-w-full p-4">

            <div className="flex justify-between items-center gap-4 mb-4 flex-nowrap">

                <div className="flex gap-6 whitespace-nowrap">
                    <p className="font-medium">
                        ST ID: <span className="font-semibold">
                            {selectedStudent?.id || "-"}
                        </span>
                    </p>


                    <p className="font-medium">
                        Name: <span className="font-semibold">
                            {selectedStudent?.name || "-"}
                        </span>
                    </p>
                    <p className="font-medium">
                        Class: <span className="font-semibold">
                            {selectedStudent?.class || "-"}
                        </span>
                    </p>
                </div>



                <div className="flex gap-3 items-center relative">

                    <ClassSelect
                        label="Select Class"
                        value={form.class_id}
                        onChange={(e) => {
                            const val = e.target.value;

                            setForm({ ...form, class_id: val });

                            handleAttendance(val, form.date, form.attendance_type);
                        }}
                        options={[
                            { label: "---Select Class Section---", value: "" },
                            "All",
                            ...sectionList.map((record) => ({
                                label: `${record.class_name ?? ""} - ${(record.section ?? "").toUpperCase()}`,
                                value: record.id,
                            })),
                        ]}
                    />
                    <FloatingInputs
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={(e) => {
                            const val = e.target.value;

                            setForm({ ...form, date: val });

                            handleAttendance(form.class, val, form.attendance_type);
                        }}
                    />


                    <div className="col-span-12 md:col-span-4 flex items-center border rounded-xl px-3 h-[42px] gap-2">
                        <FaSearch className="text-gray-500 size-5" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            onChange={(e) => handleSearch(e.target.value)}
                            className="outline-none w-full"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowExport(!showExport)}
                            className="bg-gradient-to-r bg-[#0860C4] text-white px-5 py-2 rounded-xl shadow-md flex items-center gap-2"
                        >
                            Export
                        </button>

                        {showExport && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">

                                <button
                                    onClick={exportPDF}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left"
                                >
                                    <FaFilePdf className="text-red-500" />
                                    Export PDF
                                </button>

                                <button
                                    onClick={exportExcel}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left"
                                >
                                    <FaFileExcel className="text-green-600" />
                                    Export Excel
                                </button>
                            </div>
                        )}
                    </div>

                </div>

            </div>

            <div className="overflow-x-auto bg-white rounded shadow">

                <table className="w-full border">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >#</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Name  ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer">
                                Date  ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Status  ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >In  ⬍</th>
                            <th className="px-2 md:px-3 py-2 font-medium text-[14px] whitespace-nowrap cursor-pointer"
                            >Out  ⬍</th>
                        </tr>
                    </thead>

                    <tbody>
                        {selectedStudents
                            .filter(s =>
                                s.student_name.toLowerCase().includes(search.toLowerCase())
                            )
                            .map((s, i) => (
                                <tr key={s.id} className="border-t text-center">
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{i + 1}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{s.student_name}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{form.date?.split("-").reverse().join("-")}</td>

                                    <td className={
                                        getStatus(s) === "Present"
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }>
                                        {getStatus(s)}
                                    </td>

                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{s.in_time || "--"}</td>
                                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">{s.out_time || "--"}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <CommonPagination
                currentPage={currentPage}
                totalPages={1}
                onPageChange={setCurrentPage}
                totalItems={selectedStudents.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

        </section>
    );
};

export default AttendanceSingleReports;