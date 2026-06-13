import React, { useState, useEffect } from "react";
import { ClassSelect, FloatingInput } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { Printer } from "lucide-react";

const StudentNoDues = () => {
    const [sectionList, setSectionList] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authData, setAuthData] = useState(JSON.parse(localStorage.getItem("authData") || "{}"));
    const [sessionData, setSessionData] = useState(JSON.parse(localStorage.getItem("session_data") || "{}"));

    const [form, setForm] = useState({
        class_id: "",
        searchTerm: "",
    });

    const school_id = localStorage.getItem("school_id");
    const session_id = localStorage.getItem("session_id");

    useEffect(() => {
        if (school_id) {
            fetchClasses();
        }
    }, [school_id]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(localurl + "class_section/" + school_id);
            const data = await res.json();
            if (data.success) {
                setSectionList(data.row.filter(c => c.status === "Active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const handleFind = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${localurl}students/${school_id}/${session_id}`);
            const data = await res.json();
            if (data.success) {
                let list = data.row || data.rows || [];

                // Filter logic
                if (form.class_id) {
                    list = list
                    .filter(s => s.registerClass == form.class_id )
                     .filter((item) => item.status === "active")
                }
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
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="no-dues-print-page bg-white rounded-t-2xl max-w-full p-4 min-h-[80vh]">
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

                    .no-dues-print-page,
                    .no-dues-print-page * {
                        visibility: visible !important;
                    }

                    .no-dues-print-page {
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
                        display: grid !important; 
                        grid-template-columns: repeat(2, 1fr) !important; 
                        gap: 6px !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 4px !important;
                    }

                    .certificate-card { 
                        break-inside: avoid-page !important;
                        page-break-inside: avoid !important;
                        border: 2px solid #000 !important;
                        margin-bottom: 0 !important;
                        padding: 7px !important;
                        min-height: auto !important;
                        box-shadow: none !important;
                    }

                    .certificate-card .watermark-logo {
                        width: 130px !important;
                        height: 130px !important;
                    }

                    .certificate-card .school-logo {
                        width: 48px !important;
                        height: 48px !important;
                    }

                    .certificate-card .certificate-header {
                        gap: 6px !important;
                        padding-bottom: 4px !important;
                        margin-bottom: 5px !important;
                    }

                    .certificate-card .school-meta {
                        font-size: 7px !important;
                        margin-bottom: 1px !important;
                    }

                    .certificate-card .school-name {
                        font-size: 11px !important;
                        margin-bottom: 1px !important;
                    }

                    .certificate-card .school-address,
                    .certificate-card .school-contact {
                        font-size: 7px !important;
                        margin-bottom: 1px !important;
                    }

                    .certificate-card .certificate-title {
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                        margin-bottom: 7px !important;
                    }

                    .certificate-card .certificate-title h4 {
                        font-size: 8px !important;
                    }

                    .certificate-card .certificate-content {
                        gap: 6px !important;
                        font-size: 9px !important;
                    }

                    .certificate-card .dues-line {
                        margin-top: 10px !important;
                        margin-bottom: 20px !important;
                    }

                    .certificate-card .dues-line p {
                        font-size: 10px !important;
                    }

                    .certificate-card .signature-row {
                        margin-top: 18px !important;
                    }

                    .certificate-card .signature-line {
                        width: 70px !important;
                    }

                    .certificate-card .signature-label {
                        font-size: 7px !important;
                    }

                    @page { size: A4 portrait; margin: 4mm; }
                }
            `}</style>

            <div className="no-print">
                <h2 className="text-xl font-bold text-black mb-6">Student's No Dues</h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-end">
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
                    <div className="lg:col-span-2">
                        <FloatingInput
                            label="Search "
                            value={form.searchTerm}
                            placeholder="Search Name, Father's Name, SR No, ID"
                            onChange={(e) => setForm({ ...form, searchTerm: e.target.value })}
                        />
                    </div>


                    <div className="flex gap-4">
                        <button
                            onClick={handleFind}
                            className="bg-[#008236] hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all active:scale-95"
                        >
                            Find
                        </button>
                        {filteredStudents.length > 0 && (
                            <button
                                onClick={handlePrint}
                                className="bg-[#E14D43] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Printer size={18} />
                                Print
                            </button>
                        )}
                    </div>
                </div>


            </div>

            {/* Certificate Display Area */}
            <div className="print-area grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStudents.map((student, index) => (
                    <div key={index} className="certificate-card border-2 border-blue-200 rounded-lg p-3 bg-white relative overflow-hidden shadow-sm">
                        {/* Watermark/Background effect */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                            {authData.upload_logo && (
                                <img
                                    src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${import.meta.env.VITE_SERVER_URL}/uploads/${authData.upload_logo}`}
                                    alt=""
                                    className="watermark-logo w-44 h-44 object-contain"
                                />
                            )}
                        </div>

                        {/* Header */}
                        <div className="certificate-header flex items-center gap-2 border-b-2 border-gray-200 pb-1.5 mb-2">
                            {authData.upload_logo && (
                                <img
                                    src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${import.meta.env.VITE_SERVER_URL}/uploads/${authData.upload_logo}`}
                                    alt="Logo"
                                    className="school-logo w-14 h-14 object-contain"
                                />
                            )}
                            <div className="flex-1 text-center">
                                <div className="school-meta flex justify-between text-[8px] font-bold text-gray-600 mb-0.5">
                                    <span>Reg. No. : {authData.registration_no || "-"}</span>
                                    <span>Affi. No. : {authData.affiliation_no || "-"}</span>
                                </div>
                                <h3 className="school-name text-sm font-black text-blue-900 uppercase leading-none mb-0.5">{authData.school_name}</h3>
                                <p className="school-address text-[9px] font-bold text-gray-700 uppercase leading-tight mb-0.5">{authData.address}</p>
                                <p className="school-contact text-[8px] font-bold text-gray-600 italic">Contact No. : {authData.mobile_no || authData.helpLine_no}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="certificate-title bg-gray-300 py-0.5 mb-3 text-center">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-800">No Dues Certificate</h4>
                        </div>

                        {/* Content */}
                        <div className="certificate-content space-y-2 text-[11px]">
                            <div className="flex border-b border-dotted border-gray-400 pb-1 items-baseline">
                                <span className="w-28 font-bold text-gray-600 uppercase whitespace-nowrap">Student Name:</span>
                                <span className="flex-1 font-black text-gray-800 uppercase truncate px-1">{student.studentName}</span>
                            </div>
                            <div className="flex border-b border-dotted border-gray-400 pb-1 items-baseline">
                                <span className="w-28 font-bold text-gray-600 uppercase whitespace-nowrap">Father Name:</span>
                                <span className="flex-1 font-black text-gray-800 uppercase truncate px-1">{student.fatherName}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-400 pb-1">
                                <div className="flex gap-2">
                                    <span className="font-bold text-gray-600 uppercase">Class :</span>
                                    <span className="font-black text-gray-800 uppercase">{student.section_class || student.class_name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-bold text-gray-600 uppercase">Session :</span>
                                    <span className="font-black text-gray-800 uppercase">{sessionData.session_name || "2024-25"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="dues-line mt-4 mb-8">
                            <p className="text-xs font-bold text-gray-700">
                                This student have been clear <span className="bg-blue-100 px-1 border-b-2 border-blue-600 font-black">All Dues & Fee</span>.
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="signature-row flex justify-between items-end mt-7">
                            <div className="text-center">
                                <div className="signature-line w-20 border-t border-gray-400 mt-2"></div>
                                <p className="signature-label text-[8px] font-bold text-gray-600 uppercase">Class Teacher</p>
                            </div>
                            <div className="text-center">
                                <div className="signature-line w-20 border-t border-gray-400 mt-2"></div>
                                <p className="signature-label text-[8px] font-bold text-gray-600 uppercase">Principal</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="no-print flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0860C4]"></div>
                </div>
            )}

            {!loading && filteredStudents.length === 0 && (
                <div className="no-print text-center py-20 text-gray-400 italic">
                    No students found. Use filters and click "Find".
                </div>
            )}
        </div>
    );
};

export default StudentNoDues;
