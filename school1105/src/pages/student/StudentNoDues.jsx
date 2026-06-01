import React, { useState, useEffect, useRef } from "react";
import { ClassSelect, FloatingInput } from "../../Component/common/FloatingInput";
import { localurl } from "../../api/api";
import { Printer } from "lucide-react";

const StudentNoDues = () => {
    const [sectionList, setSectionList] = useState([]);
    const [students, setStudents] = useState([]);
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
                    list = list.filter(s => s.registerClass == form.class_id);
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
        window.print();
    };

    return (
        <div className="bg-white rounded-t-2xl max-w-full p-4 min-h-[80vh]">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .print-area { 
                        display: grid !important; 
                        grid-template-columns: repeat(2, 1fr) !important; 
                        gap: 15px !important;
                        width: 100% !important;
                        padding: 10px !important;
                    }
                    .certificate-card { 
                        break-inside: avoid !important;
                        border: 2px solid #000 !important;
                        margin-bottom: 0 !important;
                    }
                    @page { size: portrait; margin: 5mm; }
                }
            `}</style>

            <div className="no-print">
                <h2 className="text-xl font-bold text-black mb-6">Student's No Dues</h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-end">
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
                    </div>                </div>

                <div className="flex gap-4 mb-8">
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

            {/* Certificate Display Area */}
            <div className="print-area grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStudents.map((student, index) => (
                    <div key={index} className="certificate-card border-2 border-blue-200 rounded-lg p-4 bg-white relative overflow-hidden shadow-sm">
                        {/* Watermark/Background effect */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                            {authData.upload_logo && (
                                <img
                                    src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${import.meta.env.VITE_SERVER_URL}/uploads/${authData.upload_logo}`}
                                    alt=""
                                    className="w-64 h-64 object-contain"
                                />
                            )}
                        </div>

                        {/* Header */}
                        <div className="flex items-center gap-3 border-b-2 border-gray-200 pb-2 mb-3">
                            {authData.upload_logo && (
                                <img
                                    src={authData.upload_logo.startsWith("data:") ? authData.upload_logo : `${import.meta.env.VITE_SERVER_URL}/uploads/${authData.upload_logo}`}
                                    alt="Logo"
                                    className="w-20 h-20 object-contain"
                                />
                            )}
                            <div className="flex-1 text-center">
                                <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-1">
                                    <span>Reg. No. : {authData.registration_no || "-"}</span>
                                    <span>Affi. No. : {authData.affiliation_no || "-"}</span>
                                </div>
                                <h3 className="text-lg font-black text-blue-900 uppercase leading-none mb-1">{authData.school_name}</h3>
                                <p className="text-[11px] font-bold text-gray-700 uppercase leading-tight mb-1">{authData.address}</p>
                                <p className="text-[10px] font-bold text-gray-600 italic">Contact No. : {authData.mobile_no || authData.helpLine_no}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="bg-gray-300 py-1 mb-4 text-center">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">No Dues Certificate</h4>
                        </div>

                        {/* Content */}
                        <div className="space-y-3 text-xs">
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

                        <div className="mt-6 mb-12">
                            <p className="text-sm font-bold text-gray-700">
                                This student have been clear <span className="bg-blue-100 px-1 border-b-2 border-blue-600 font-black">All Dues & Fee</span>.
                            </p>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-between items-end mt-10">
                            <div className="text-center">
                                <div className="w-24 border-t border-gray-400 mt-2"></div>
                                <p className="text-[10px] font-bold text-gray-600 uppercase">Class Teacher</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 border-t border-gray-400 mt-2"></div>
                                <p className="text-[10px] font-bold text-gray-600 uppercase">Principal</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0860C4]"></div>
                </div>
            )}

            {!loading && filteredStudents.length === 0 && (
                <div className="text-center py-20 text-gray-400 italic">
                    No students found. Use filters and click "Find".
                </div>
            )}
        </div>
    );
};

export default StudentNoDues;
